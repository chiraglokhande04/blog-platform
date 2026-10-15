const mongoose = require("mongoose")

// mongodb -> database //ODM.  // mongoose
// sql -> ORM  -> sequelize, drizzle, prisma

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
        description: {
            type: String,
            maxlength: 300,
            default: ""
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
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category'
        },

        status: {
            type: String,
            enum: ["draft","published"],
            default: "draft"
        },
        tags: [{
            type: String,
            trim: true,
            lowercase: true
        }],
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