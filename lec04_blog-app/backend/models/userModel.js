const mongoose = require("mongoose");
// user schema 
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true,

    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    bio: {
        type: String
    },
    password: {
        type: String,
        required: true,
        unique: true,
        select: false
    },
    // blogs -> user author
    blogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog"
    }],
    isVerified: {
        type: Boolean,
        default: false,
        select: false
    },
    isGoogleAuth: {
        type: Boolean,
        default: false,
        select: false

    },
    profilePic: {
        type: String,
        default: null
    },
    profilePicId: {
        type: String,
        default: null
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    likedBlogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog"
    }],
    savedBlogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog"
    }],
})

// compile model using schema
const User = mongoose.model("User", userSchema);

// export model
module.exports = User;