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
    content: {
        type: Object,
        required: true
    },
    draft: {
        type: Boolean,
        default: false
    },
    blogId: {
        type: String,
        required: true,
        unique: true
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
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    // comments
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],
    savedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    tag: {
        type: [String]
    }
}, { timestamps: true })

// model
const Blog = mongoose.model("Blog", blogSchema);

// export model
module.exports = Blog;