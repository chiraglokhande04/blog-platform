// controllers/comment.controller.js

const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const Blog = require("../models/Blog");

// Get all comments for a published blog.
const getBlogComments = async (req, res) => {
  try {
    const { blogId } = req.params;

    // Validate the blog ID before querying MongoDB.
    if (!mongoose.isValidObjectId(blogId)) {
      return res.status(400).json({ message: "Invalid blog ID" });
    }

    // Only show comments for published blogs.
    const blog = await Blog.findOne({
      _id: blogId,
      status: "published",
    }).select("_id");

    if (!blog) {
      return res.status(404).json({ message: "Published blog not found" });
    }

    // Return comments as a flat list; parentComment identifies replies.
    const comments = await Comment.find({ blog: blogId })
      .populate("author", "name username avatar")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      count: comments.length,
      comments,
    });
  } catch (error) {
    console.error("Get comments error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Create a new comment or a reply to an existing comment.
const createComment = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { content, parentComment } = req.body;

    // Validate the blog ID.
    if (!mongoose.isValidObjectId(blogId)) {
      return res.status(400).json({ message: "Invalid blog ID" });
    }

    // Reject empty or invalid comment content.
    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    // Keep comment content within a reasonable limit.
    if (content.trim().length > 5000) {
      return res.status(400).json({
        message: "Comment cannot exceed 5000 characters",
      });
    }

    // A comment can only be added to a published blog.
    const blog = await Blog.findOne({
      _id: blogId,
      status: "published",
    }).select("_id");

    if (!blog) {
      return res.status(404).json({ message: "Published blog not found" });
    }

    // If parentComment is provided, verify it belongs to this blog.
    if (parentComment) {
      if (!mongoose.isValidObjectId(parentComment)) {
        return res.status(400).json({ message: "Invalid parent comment ID" });
      }

      const parent = await Comment.findOne({
        _id: parentComment,
        blog: blogId,
      }).select("_id");

      if (!parent) {
        return res.status(404).json({
          message: "Parent comment not found for this blog",
        });
      }
    }

    // Use the authenticated user as the author, never a client-supplied ID.
    const comment = await Comment.create({
      blog: blogId,
      author: req.user.id,
      content: content.trim(),
      parentComment: parentComment || null,
    });

    // Return the comment with public author details.
    const populatedComment = await Comment.findById(comment._id).populate(
      "author",
      "name username avatar"
    );

    return res.status(201).json({
      message: "Comment created successfully",
      comment: populatedComment,
    });
  } catch (error) {
    console.error("Create comment error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Edit a comment created by the logged-in user.
const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    // Validate the comment ID.
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid comment ID" });
    }

    // Validate the new content.
    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    if (content.trim().length > 5000) {
      return res.status(400).json({
        message: "Comment cannot exceed 5000 characters",
      });
    }

    // Find a comment owned by the authenticated user.
    const comment = await Comment.findOne({
      _id: id,
      author: req.user.id,
    });

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found or you are not authorized to edit it",
      });
    }

    // Update only the content field.
    comment.content = content.trim();
    await comment.save();

    // Populate author details for the response.
    await comment.populate("author", "name username avatar");

    return res.status(200).json({
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    console.error("Update comment error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a comment created by the logged-in user.
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the comment ID.
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid comment ID" });
    }

    // Only the comment author can delete it through this endpoint.
    const comment = await Comment.findOne({
      _id: id,
      author: req.user.id,
    });

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found or you are not authorized to delete it",
      });
    }

    // Find every descendant reply, including replies to replies.
    let idsToDelete = [comment._id];
    let frontier = [comment._id];

    while (frontier.length > 0) {
      const children = await Comment.find({
        parentComment: { $in: frontier },
      }).select("_id");

      frontier = children.map((child) => child._id);
      idsToDelete.push(...frontier);
    }
    

    // Delete the selected comment and its entire reply tree.
    await Comment.deleteMany({
      _id: { $in: idsToDelete },
    });

    return res.status(200).json({
      message: "Comment and its replies deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Export all comment controller functions.
module.exports = {
  getBlogComments,
  createComment,
  updateComment,
  deleteComment,
};