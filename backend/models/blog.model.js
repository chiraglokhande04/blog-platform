const mongoose = require("mongoose")

const blogSchema = new mongoose.Schema(
    {
        title:{
            type:String,
            required: true,
            maxlength: 200,
        },
        slug:{
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        content:{
            type: String,
            required: true
        },
        coverImage:{
            type: String,
            default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZ3NOYUuuKQA7EymNxICPYU6vL74ou7KeOZIlABkgXrw&s=10"
        },
        author:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        category: {
            type: String,
            default: "General"
        },
        tags: {
            type: String,
            enum: ["draft","published"],
            default: "draft"
        },
        publishedAt: {
            type: Date,
            default: null
        },
        views:{
            type: Number,
            default: 0,
            min: 0
        },
        likes: [{
            type: mongoose.Schema.Type.ObjectId,
            ref: "User",
        }],
        comments: [{
            type: mongoose.Schema.Type.ObjectId,
            ref: "Comment",
        }],
    },
    {timestamps: true}
)

module.exports = mongoose.model("Blog", blogSchema)

//blogs/devtech-solutions
// blogs/:id