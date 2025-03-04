const { trusted } = require("mongoose");
const Blog = require("../models/blogModel.js")
const User = require("../models/userModel.js");
const { validToken, decodeToken } = require("../utils/generateToken.js");


async function getBlogs(req, res) {
    try {
        const blogs = await Blog.find({ "draft": false }).populate({ path: 'creator', select: '-password' });
        return res.json({
            "success": true,
            "message": "Blogs fetched successfully...",
            blogs
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            "message": "Error fetching blogs",
            "error": err.message
        })
    }

}

async function getBlog(req, res) {
    try {
        // draft false ->  only accessed by blog author, authorization will be required
        const blog = await Blog.findById(req.params.id);
        return res.json({
            "success": true,
            "message": "Blog fetched successfully...",
            blog
        })
    } catch (err) {
        return res.status(500).json({
            "success": false,
            "message": "Error fetching blog",
            "error": err.message
        })
    }

}

async function createBlog(req, res) {
    try {

        // decoded
        console.log("Decoded Token: ", decodeToken(req.body.token));

        // creating blog -> check valid authenticated
        const isValid = validToken(req.body.token);

        // not valid token -> early return
        if (!isValid) {
            return res.status(400).json({
                "success": false,
                "message": "Invalid Token"
            })
        }

        const { title, description, draft, creator } = req.body;
        // check user with id creator exists
        const author = await User.findById(creator)

        // validations
        if (!title) {
            return res.status(400).json({
                "success": false,
                "message": "Please enter the title"
            })
        }
        if (!description) {
            return res.status(400).json({
                "success": false,
                "message": "Please enter the title"
            })
        }
        // creator not there -> early return
        if (!author) {
            return res.status(404).json({
                "success": false,
                "message": "Creator not found"
            })
        }

        const blog = await Blog.create({ title, description, draft, creator });

        // blog create -> add blogs in user collection
        await User.findByIdAndUpdate(creator, { $push: { blogs: blog._id } });

        return res.json({
            "success": true,
            "message": "Blog created successfully..."
        })

    } catch (err) {
        return res.status(500).json({
            "success": false,
            "message": "Error creating blogs",
            "error": err.message
        })
    }

}

async function updateBlog(req, res) {
    try {
        const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Return the updated document
            runValidators: true // Ensure validation is applied
        });
        // check if the user exists
        if (!updatedBlog) {
            return res.status(404).json({
                "success": false,
                "message": "Blog not found"
            });
        }
        return res.json({
            "success": true,
            "message": "Blog updated successfully..."
        })

    } catch (err) {
        return res.status(500).json({
            "success": false,
            "message": "Error updating blogs",
            "error": err.message
        })
    }
}

async function deleteBlog(req, res) {
    try {
        await Blog.findByIdAndDelete(req.params.id)
        return res.json({
            "success": true,
            "message": "Blog deleted successfully..."
        })
    } catch (err) {
        return res.status(500).json({
            "success": false,
            "message": "Error deleting blogs",
            "error": err.message
        })
    }
}


module.exports = {
    getBlogs,
    getBlog,
    createBlog,
    updateBlog,
    deleteBlog
}