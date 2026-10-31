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



const getAllUsers = async(req, res) => {
    try{
        const { page, limit, skip } = getPagination(req.query)

        if (req.query.search?.trim()){
            const search = req.query.search.trim().slice(0,100)
            const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

            filter.$or = [
                { name: {$regex: escaped, $options: "i"}},
                { username: {$regex: escaped, $options: "i"}},
                { email: {$regex: escaped, $options: "i"}},
            ]

        }

        if(["user","admin"].includes(req.query.role)){
            filter.role = req.query.role
        }

        const [users,total] = await Promise.all([
            User.find(filter)
            .select("-password")
            .sort({createdAt: -1})
            .skip(skip)
            .limit(limit),

            User.countDocuments(filter)
        ])

        return res.status(200).json({
            users,
            pagination:{
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        })
    }catch(err){

         console.log("Error in getallusers: ", err)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })

    }
}
