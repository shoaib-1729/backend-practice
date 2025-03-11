const mongoose = require("mongoose");
const Blog = require("../models/blogModel.js")
const User = require("../models/userModel.js");


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

        // extract creator id from req custom field
        let creator = req.user;

        const { title, description, draft } = req.body;

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
        // update blog
        const { title, description, draft } = req.body;
        // extract id from params
        const { id } = req.params;

        // Check if the id is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        // blog by id
        const blog = await Blog.findById(id);

        // creator id
        const creator = req.user;

        // validation
        // if blog does not exits?
        if (!blog) {
            return res.status(400).json({
                "success": false,
                "message": "Blog does not exists",
            })
        }

        // check the user is valid to update blog?
        if (blog.creator != creator) {
            return res.status(400).json({
                "success": false,
                "message": "You are not authorized for this action",
            })
        }


        // update blog
        const updatedBlog = await Blog.findByIdAndUpdate(id, {
            title,
            description,
            draft
        }, { new: true })

        return res.status(200).json({
            "success": true,
            "message": "Blog updated successfully...",
            "blog": updatedBlog
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
        // blog id
        const { id } = req.params;

        // Check if the id is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        // find blog by id
        const blog = await Blog.findById(id);
        const creator = req.user;



        // validation
        // blog id valid?
        if (!blog) {
            return res.status(400).json({
                "success": false,
                "message": "Blog does not exits",
            })
        }
        // check user deleting the blog is creator or not?
        if (blog.creator != creator) {
            return res.status(400).json({
                "success": false,
                "message": "You are not authorized for this action",
            })
        }


        // delete blog
        await Blog.findByIdAndDelete(id);

        // user se bhi delete karo
        await User.findByIdAndUpdate(creator, { $pull: { blogs: id } })


        return res.status(200).json({
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