const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema(
    {
        blog: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Blog',
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: true,
            maxlenght: 2000
        },
        parentComment:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null
        },
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }]
    },
    {timestamps: true}
)

module.exports = mongoose.model("Comment", commentSchema)