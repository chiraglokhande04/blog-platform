const mongoose = require("mongoose")
const Blog = require("../models/blog.model")
const Category = require("../models/category.model");





// Helpers
const createSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "") // removes chars who are not lowercase and remove numbers
        .replace(/\s+/g, "-") // replace two consecutive spaces into hyphen
        .replace(/-+/g, "-") // replace two consecutive hyphens into single hyphen
        .replace(/^-|-$/g, "") // remove hyphes at start and end
}


// Generate a unique slug
const generateUniqueSlug = async (title, excludeId = null) => {
    const baseSlug = createSlug(title) || "untitled" //my-tech-journey

    let slug = baseSlug
    let count = 1

    while (
        await Blog.exists({
            slug,
            ...(excludeId
                ? { _id: { $ne: excludeId } }
                : {}),

        })
    ) {
        slug = `${baseSlug}-${count}`
        count++

    }
    return slug
    // my-tech-journey-5
}



// Create Blog
const createBlog = async (req, res) => {
    try {
        const {
            title,
            content,
            description,
            coverImage,
            category,
            tags,
            status
        } = req.body

        if (!title?.trim() || !content?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Title and Content are required"
            })
        }

        if (status !== undefined && !["draft", "published"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Status"
            })
        }

        if (
            category &&
            !mongoose.isValidObjectId(category)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid Category"
            })
        }

        if (tags !== undefined && !Array.isArray(tags)) {
            return res.status(400).json({
                success: true,
                message: "Tags must be an array"
            })
        }

        const blogStatus = status || "draft"
        const slug = await generateUniqueSlug(title)

        const blog = await Blog.create({
            title: title.trim(),
            slug,
            content,
            description,
            coverImage: coverImage || "",
            author: req.user.id,
            category: category || null,
            tags: tags || [],
            status: blogStatus,
            publishedAt: new Date()

        })

        const populatedBlog = await Blog.findById(blog._id)
            .populate("author", "name username profile_img")
            .populate("category", "name slug")


        return res.status(201).json({
            success: true,
            message: "Blog Created Successfully",
            blog: populatedBlog
        })


    } catch (err) {

        console.log("Error in CreateBlog Controller: ", err)
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}



const getAllBlogs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            category,
            tag,
            author,
            sort = "latest"
        } = req.query


        const pageNumber = Math.max(1, parseInt(page, 10) || 1)
        const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10) || 10))

        const filter = { status: "published" }

        if (search?.trim()) {
            const escapedSearch = search
                .trim()
                .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

            filter.$or = [
                { title: { $regex: escapedSearch, $options: "i" } },
                { description: { $regex: escapedSearch, $options: "i" } },
                { content: { $regex: escapedSearch, $options: "i" } }
            ]
        }

        if (category) {
            if (!mongoose.isValidObjectId(category)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Category"
                })
            }

            filter.category = category
        }

        if (tag?.trim()) {
            filter.tags = tag.trim().toLowerCase()
        }

        if (author) {
            if (!mongoose.isValidObjectId(author)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid User"
                })
            }

            filter.author = author
        }

        const sortOptions = {
            latest: { publishedAt: -1 },
            oldest: { publishedAt: 1 },
            popular: { likes: -1, publishedAt: -1 },
            mostViewed: { views: -1, publishedAt: -1 }
        }

        const sortBy = sortOptions[sort] || sortOptions.latest


        const [blogs, totalBlogs] = await Promise.all([
            Blog.find(filter)
                .populate("author", "name username profile_img")
                .populate("category", "name slug")
                .sort(sortBy)
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize),

            Blog.countDocuments(filter)
        ])

        return res.status(200).json({
            success: true,
            blogs,
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.ceil(totalBlogs / pageSize),
                totalBlogs,
                limit: pageSize
            }
        })


    } catch (err) {
        console.log("Error in getAllBlogs Controller: ", err)
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })

    }
}


const getBlogBySlug = async (req, res) => {
    try {

        const blog = await Blog.findOneAndUpdate({
            slug: req.params.slug,
            status: "published"
        })
            .populate("author", "name username profile_img")
            .populate("category", "name slug")


        if (!blog) {
            return res.status(404).json({
                status: false,
                message: "Blog not found"
            })
        }

        return res.status(200).json({
            success: true,
            blog,
        })

    } catch (err) {
        console.log("Error in getblogBySlug Controller: ", err)
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })

    }
}


const getMyBlogs = async (req, res) => {
    try {

        const {
            page = 1,
            limit = 10,
            status
        } = req.query

        const pageNumber = Math.max(1, parseInt(page, 10) || 1)
        const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10) || 10))

        const filter = { author: req.user.id }

        if (status) {
            if (!["draft", "published"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Status"
                })
            }

            filter.status = status
        }

        const [blogs, totalBlogs] = await Promise.all([
            Blog.find(filter)
                .populate("category", "name slug")
                .sort({ updatedAt: -1 })
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize),

            Blog.countDocuments(filter)

        ])
        return res.status(200).json({
            success: true,
            blogs,
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.ceil(totalBlogs / pageSize),
                totalBlogs,
                limit: pageSize
            }
        })


    } catch (err) {
        console.log("Error in getMyBlogs Controller: ", err)
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}



const updateBlog = async (req, res) => {
    try {

        const {
            title,
            content,
            description,
            coverImage,
            category,
            tags,
            status
        } = req.body

        const blog = await Blog.findById(req.params.id)

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            })
        }

        if (blog.author.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            })
        }


        if (title !== undefined) {
            if (!title.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Title cannot be empty"
                })
            }
        }

        blog.title = title.trim()
        blog.slug = await generateUniqueSlug(title, blog._id)

        if (content !== undefined) {
            if (!content.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Content cannot be empty"
                })
            }
            blog.content = content
        }

        if (description !== undefined) {
            blog.description = description
        }
        if (coverImage !== undefined) {
            blog.coverImage !== coverImage
        }

        if (category !== undefined) {
            if (
                category &&
                !mongoose.isValidObjectId(category)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Category"
                })
            }
            blog.category = category
        }

        if (tags !== undefined) {
            if (!Array.isArray(tags)) {
                return res.status(400).json({
                    success: false,
                    message: "Tags must be an Array"
                })
            }

            blog.tags = tags
        }

        if (status !== undefined) {
            if (!["draft", "published"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Status"
                })
            }
            if (status === "published" && !blog.publishedAt) {
                blog.publishedAt = new Date()
            }
            blog.status = status
        }

        await blog.save();

        const updatedBlog = await Blog.findById(blog._id)
            .populate("author", "name username profile_img")
            .populate("category", "name slug")

        return res.status(200).json({
            success: true,
            blog: updatedBlog
        })

    } catch (err) {

        console.log("Error in getMyBlogs Controller: ", err)
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })

    }
}

const publishBlog = async (req, res) => {
    try {

        const blog = await Blog.findById(req.params.id)

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            })
        }

        if (blog.author.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            })
        }

        if (blog.status == "published") {
            return res.status(400).json({
                success: false,
                message: "Blog is already published"
            })
        }

        blog.status = "published"
        blog.publishedAt = new Date()

        await blog.save()

        return res.status(200).json({
            sucess: true,
            message: "Blog published Successfully",
            blog
        })

    } catch (err) {
        console.log("Error in publishBlog Controller: ", err)
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })

    }
}


const deleteBlog = async (req, res) => {
    try {

        const blog = await Blog.findById(req.params.id)

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            })
        }

        if (blog.author.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            })
        }

        await blog.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Blog deleted successfully"
        })

    } catch (err) {
        console.log("Error in deleteBlog Controller: ", err)
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })

    }
}



const toggleLike = async (req, res) => {
    try {

        const blog = await Blog.findOne({
            _id: req.params.id,
            status: "published"
        })

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Published blog not found"
            })
        }

        const userId = req.user.id.toString()

        const alreadyLiked = blog.likes.some(
            (id) => id.toString() === userId
        )

        if(alreadyLiked){
            blog.likes.pull(req.user.id)
        }else{
            blog.likes.addToSet(req.user.id)
        }

        await blog.save()
        return res.status(200).json({
            success: true,
            message: alreadyLiked ?
            "Blog dislike successfully" :
            "Blog liked successfully",
            liked: !alreadyLiked,
            likesCount : blog.likes.length,

        })

    } catch (err) {
        console.log("Error in toggleLike Controller: ", err)
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })

    }
}



// createBlog
//getAllBlogs
//getBlogBySlug
//getMyBlogs
//updateBlog

//publishBlog
//deleteBlog
//toggleLike

module.exports = {
    createBlog,
    getAllBlogs,
    getBlogBySlug,
    getMyBlogs,
    updateBlog,
    publishBlog,
    deleteBlog,
    toggleLike
}