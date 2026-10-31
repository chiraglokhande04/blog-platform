//dashboardstats
//getallusers,
//updateuserrole
//deleteUser
//getallblogs
//deleteblog
//getallcategories
//createcategory
//updatecategory
//deletecategory

// blockUser
// unblockUser



const mongoose = require("mongoose")
const User = require("../models/user.model")
const Blog = require("../models/blog.model")
const Category = require("../models/category.model")
const Comment = require("../models/comment.controller")
const Bookmark = require("../models/bookmark.controller")

// create Slug
const createSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "") // removes chars who are not lowercase and remove numbers
        .replace(/\s+/g, "-") // replace two consecutive spaces into hyphen
        .replace(/-+/g, "-") // replace two consecutive hyphens into single hyphen
        .replace(/^-|-$/g, "") // remove hyphes at start and end
}

const validId = (id) => mongoose.isValidObjectId(id)

const getPagination = (query) => {
    const page = Math.max(1, parseInt(query.page, 10) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 10))
    return { page, limit, skip: (page - 1) * limit }
}



const getDashboardStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalBlogs,
            publishedBlogs,
            draftBlogs,
            totalCategories,
            totalComments
        ] = await Promise.all([
            User.countDocuments(),
            Blog.countDocuments(),
            Blog.countDocuments({ status: "published" }),
            Blog.countDocuments({ status: "draft" }),
            Category.countDocuments(),
            Comment.countDocuments()
        ])

        return res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalBlogs,
                publishedBlogs,
                draftBlogs,
                totalCategories,
                totalComments
            }
        })

    } catch (err) {

        console.log("Error in get dashboard stats: ", err)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

const getAllUsers = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req.query)

        if (req.query.search?.trim()) {
            const search = req.query.search.trim().slice(0, 100)
            const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

            filter.$or = [
                { name: { $regex: escaped, $options: "i" } },
                { username: { $regex: escaped, $options: "i" } },
                { email: { $regex: escaped, $options: "i" } },
            ]

        }

        if (["user", "admin"].includes(req.query.role)) {
            filter.role = req.query.role
        }

        const [users, total] = await Promise.all([
            User.find(filter)
                .select("-password")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            User.countDocuments(filter)
        ])

        return res.status(200).json({
            users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (err) {

        console.log("Error in getallusers: ", err)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })

    }
}


// deleteUser
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Prevent accidental self-deletion.
    if (id === req.user.id) {
      return res.status(400).json({
        message: "You cannot delete your own account here",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Never delete the last administrator.
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });

      if (adminCount <= 1) {
        return res.status(409).json({
          message: "Cannot delete the last administrator",
        });
      }
    }

    // Find blogs written by this user.
    const authoredBlogs = await Blog.find({ author: id }).select("_id");
    const blogIds = authoredBlogs.map((blog) => blog._id);

    // Remove their authored blogs, comments, and bookmarks.
    await Promise.all([
      Blog.deleteMany({ author: id }),
      Comment.deleteMany({
        $or: [
          { author: id },
          { blog: { $in: blogIds } },
        ],
      }),
      Bookmark.deleteMany({
        $or: [
          { user: id },
          { blog: { $in: blogIds } },
        ],
      }),

      // Remove this user from other users' social lists.
      User.updateMany(
        {},
        { $pull: { followers: id, following: id } }
      ),

      // Remove their likes from remaining blogs and comments.
      Blog.updateMany({}, { $pull: { likes: id } }),
      Comment.updateMany({}, { $pull: { likes: id } }),
    ]);

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      message: "User and associated content deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// updateuserRole

const updateUserRole = async (req, res) => {
    try {

        const { id } = req.params
        const { role } = req.body

        if (!isValid(id)) {
            return res.status(400).json({
                message: "Invalid User Id"
            })
        }

        if (!["user", "admin"].includes(role)) {
            return res.status(400).json({
                message: "Role must be either user or admin"
            })
        }

        if (id === req.user.id && role !== "admin") {
            return res.status(400).json({
                message: "You cannot demote your own account"
            })
        }

        const user = await User.findById(id)

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        //admin@admin.com
        //admin@gmail.com

        // if (user.role === "admin" && role === "user") {
        //     const adminCount = await User.countDocuments({ role: "admin" })

        //     if (adminCount <= 1){
        //         return res.status(409).json({
        //             message: "Cannot demote the last admin"
        //         })
        //     }
        // }

        adminEmail = "admin@admin.com"
        userEmail = user.email

        if (adminEmail === user.email) {
            return res.status(400).json({
                message: "You cannot update role of Superadmin"
            })
        }

        user.role = role
        await user.save()

        return res.status(200).json({
            message: "User role updated successfully",
            user: {
                id: user._id,
                name: user.name,
                username:user.username,
                role: user.role
            }
        })

    } catch (err) {

          console.log("Error in updateUserRole: ", err)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })

    }
}