const mongoose = require("mongoose");


// schema
const commentSchema = new mongoose.Schema({
    // comment, blog id, user id
    comment: {
        type: String,
        required: true
    },
    blog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    // for nested comment
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],

    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: null,
    }

}, { timestamps: true })

// model 
const Comment = mongoose.model("Comment", commentSchema);

// export model
module.exports = Comment;