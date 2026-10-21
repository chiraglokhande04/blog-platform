const express = require("express")
const router = express.Router()
const {
    createBlog,
    getAllBlogs,
    getBlogBySlug,
    getMyBlogs,
    updateBlog,
    publishBlog,
    deleteBlog,
    toggleLike
} = require("../controllers/blog.controller")
const { protect } = require("../middlewares/auth.middleware")


// middleware


// public
router.get("/", getAllBlogs)
router.get("/slug/:slug",getBlogBySlug)

// protected Routes
router.get("/my-blogs",protect,getMyBlogs)
router.post("/", protect,createBlog)
router.put("/:id", protect,updateBlog)
router.patch("/publish/:id",protect,publishBlog)
router.delete("/:id", protect,deleteBlog)
router.post("/:id/like", protect,toggleLike)

module.exports = router