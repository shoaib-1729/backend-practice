const mongoose = require("mongoose");
// user schema 
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    // blogs -> user author
    blogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog"
    }],
    isVerify: {
        type: Boolean,
        default: false
    }
})

// compile model using schema
const User = mongoose.model("User", userSchema);

// export model
module.exports = User;