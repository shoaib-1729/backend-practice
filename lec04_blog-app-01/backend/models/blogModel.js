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
    // blog -> creator
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true })

// model
const Blog = mongoose.model("Blog", blogSchema);

// export model
module.exports = Blog;