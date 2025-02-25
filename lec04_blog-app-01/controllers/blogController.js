const Blog = require("../models/blogModel.js")
const User = require("../models/userModel.js")

async function getBlogs(req, res) {
    try {
        const blogs = await Blog.find({ "draft": false }).populate({ path: 'creator', select: '-password' });
        res.json({ "message": "Blogs fetched successfully...", blogs })
    } catch (err) {
        res.status(500).json({ "message": "Error fetching blogs", "error": err.message })
    }

}
async function getBlog(req, res) {
    try {
        // draft false ->  only accessed by blog author, authorization will be required
        const blog = await Blog.findById(req.params.id);
        res.json({ "message": "Blog fetched successfully...", blog })
    } catch (err) {
        res.status(500).json({ "message": "Error fetching blog", "error": err.message })
    }

}
async function createBlog(req, res) {
    try {
        const { title, description, draft, creator } = req.body;
        // check user with id creator exists
        const author = await User.findById(creator)

        // validations
        if (!title) {
            res.status(400).json({ "message": "Please enter the title" })
        }
        if (!description) {
            res.status(400).json({ "message": "Please enter the title" })
        }
        // creator not there -> early return
        if (!author) {
            res.status(404).json({ "message": "Creator not found" })
        }

        const blog = await Blog.create({ title, description, draft, creator });

        // blog create -> add blogs in user collection
        await User.findByIdAndUpdate(creator, { $push: { blogs: blog._id } });

        res.json({ "message": "Blog created successfully..." })

    } catch (err) {
        res.status(500).json({ "message": "Error creating blogs", "error": err.message })
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
            return res.status(404).json({ message: "Blog not found" });
        }
        res.json({ "message": "Blog updated successfully..." })

    } catch (err) {
        res.status(500).json({ "message": "Error updating blogs", "error": err.message })
    }
}
async function deleteBlog(req, res) {
    try {
        await Blog.findByIdAndDelete(req.params.id)
        res.json({ "message": "Blog deleted successfully..." })
    } catch (err) {
        res.status(500).json({ "message": "Error deleting blogs", "error": err.message })
    }
}


module.exports = {
    getBlogs,
    getBlog,
    createBlog,
    updateBlog,
    deleteBlog
}