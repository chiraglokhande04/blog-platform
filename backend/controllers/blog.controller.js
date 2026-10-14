const mongoose = require("mongoose")
const Blog = require("../models/blog.model")

// createBlog
//getAllBlogs
//getBlogBySlug
//getMyBlogs
//updateBlog
//publishBlog
//deleteBlog
//toggleLike



//My tech journey 

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
const generateUniqueSlug = async (title, excludId = null) => {
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
            converImage,
            category,
            tags
        } = req.body

        if (!title?.trim() || content?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Title and Content are required"
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

        const slug = await generateUniqueSlug(title)

        const Blog = await Blog.create({
            title: title.trim(),
            slug,
            content,
            coverImage: coverImage || "",
            author: req.user.id,
            category: category || null,
            tags: tags || [],
            publishedAt: new Date()

        })

        const populatedBlog = await Blog.findById(blog._id)
            .populate("author", "name username avatar")
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
        const pageSize = math.min(50, Math.max(1, parseInt(limit, 10) || 10))

        const filter = {}

        if (search?.trim()) {
            const escapedSearch = search
                .trim()
                .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

            filter.$or = [
                { title: { $regex: escapedSearch, $options: "i" } },
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
                .populate("author", "name username avatar")
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