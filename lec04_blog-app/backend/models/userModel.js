const mongoose = require("mongoose");
// user schema
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    bio: {
        type: String,
    },
    password: {
        type: String,
        // required: true,
        required: function() {
            return !this.isGoogleAuth; // google se aaye users ke liye password required nahi
        },
        // unique: true,
        select: false,
    },
    isTempPassword: {
        type: Boolean,
        default: false,
        select: false,
    },
    tempPasswordExpiry: {
        type: Date,
        default: null,
        select: false,
    },
    // blogs -> user author
    blogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
    }, ],
    isVerified: {
        type: Boolean,
        default: false,
        select: false,
    },
    isGoogleAuth: {
        type: Boolean,
        default: false,
        select: false,
    },
    profilePic: {
        type: String,
        default: null,
    },
    profilePicId: {
        type: String,
        default: null,
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }, ],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }, ],
    likedBlogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
    }, ],
    savedBlogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
    }, ],
    showSavedBlogs: {
        type: Boolean,
        default: false,
    },
    showLikedBlogs: {
        type: Boolean,
        default: true,
    },
    showDraftBlogs: {
        type: Boolean,
        default: false,
    },
});

// compile model using schema
const User = mongoose.model("User", userSchema);

// export model
module.exports = User;