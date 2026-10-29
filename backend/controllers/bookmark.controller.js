// add
//remove
//get

const mongoose = require("mongoose")
const Bookmark = require("../models/bookmark.model")
const Blog = require("../models/blog.model")


const addBookmark = async(req, res)=>{
    try{

        const { blogId } = req.params

        if(!mongoose.isValidObjectId(blogId)){
            return res.status(400).json({
                message: "Invalid blog Id"
            })
        }
        const blog = await Blog.findOne({
            _id: blogId,
            status: "published"
        })

        if(!blog){
            return res.status(404).json({
                message: "Published blog not found"
            })
        }

        const existingBookmark = await Bookmark.findOne({
            user: req.user.id,
            blog: blogId
        })

        if(existingBookmark){
           return res.status(409).json({
                message: "Blog already bookmarked"
            })
        }

        const bookmark = await Bookmark.create({
            user: req.user.id,
            blog: blogId
        })

        return res.status(201).json({
            message: "Blog bookmarked successfully",
            bookmark
        })

    }catch(err){
        console.log("Error in addBookmark controller: ", err)
        return res.status(500).json({
            message: "Internal server error"
        })

    }
}


const removeBookmark = async(req,res) => {
    try{
         
        const {blogId} = req.params

         if(!mongoose.isValidObjectId(blogId)){
            return res.status(400).json({
                message: "Invalid blog Id"
            })
        }

        const bookmark = await Bookmark.findOneAndDelete({
            user: req.user.id,
            blog: blogId
        })

        if (!bookmark){
            return res.status(404).json({
                message: "Bookmark not found"
            })
        }

        return res.status(200).json({
            message: "Blog removed from bookmarks"
        })

    }catch(err){
         console.log("Error in removeBookmark controller: ", err)
        return res.status(500).json({
            message: "Internal server error"
        })

    }
}


const getMyBookmarks = async(req, res)=>{
    try{

        const bookmarks = await find({
            user: req.user.id
        })
        .populate({
            path: "blog",
            match: { status: "published"},
            populate:{
                path:"author",
                select: "name username profile_img"
            }
        })
        .sort({ createdAt: -1})

        const savedBlogs = bookmarks.filter((bookmark) => bookmark.blog)
        .map((bookmark) => bookmark.blog)

        return res.status(200).json({
            count: savedBlogs.length,
            bookmarks: savedBlogs
        })

    }catch(err){
          console.log("Error in getMyBookmarks controller: ", err)
        return res.status(500).json({
            message: "Internal server error"
        })

    }
}


module.exports = {
    addBookmark,
    removeBookmark,
    getMyBookmarks
}
