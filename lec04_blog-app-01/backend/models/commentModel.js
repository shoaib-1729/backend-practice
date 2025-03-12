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

    }

})

// model 
const Comment = mongoose.model("Comment", commentSchema);

// export model
module.exports = Comment;