const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    draft: {
        type: Boolean,
        default: false
    },
    // image url
    image: {
        type: String,
        required: true
    },
    // image url
    imageId: {
        type: String,
        required: true
    },
    // blog -> creator
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // blog -> likes
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    // comments
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }]
}, { timestamps: true })

// model
const Blog = mongoose.model("Blog", blogSchema);

// export model
module.exports = Blog;