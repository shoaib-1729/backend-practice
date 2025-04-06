const mongoose = require("mongoose");
const fs = require("node:fs");
const Blog = require("../models/blogModel.js")
const User = require("../models/userModel.js");
const { v4: uuidv4 } = require('uuid');
const { cloudinaryImageUpload, cloudinaryDestroyImage } = require("../config/cloudinaryConfig.js")

// get all blogs controller
async function getBlogs(req, res) {
    try {
        const blogs = await Blog.find({ "draft": false }).populate({
            path: "creator",
            select: "-password"
        }).populate({
            path: "likes",
            select: "name email"
        });
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

// get blog by id controller
async function getBlog(req, res) {
    try {
        const { id } = req.params;
        // draft false ->  only accessed by blog author, authorization will be required
        const blog = await Blog.findOne({ blogId: id }).populate({
            path: "comments",
            // populate user inside comments (nested populate)
            // populating user because username is required for displaying above the comment
            populate: {
                path: "user",
                select: "name email"
            }
        }).populate({
            path: "creator",
            select: "name email"
        });
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

// create blog controller
async function createBlog(req, res) {
    try {

        // extract creator id from req custom field
        let creator = req.user;

        const { title, description, draft } = req.body;
        console.log(req.body);

        // blog id wala kaam karna hoga
        const randomId = title
            .trim() // Remove leading & trailing spaces
            .toLowerCase() // Convert to lowercase
            .replace(/[^a-zA-Z0-9\s]/g, "") // Remove special characters
            .replace(/\s+/g, "-") // Replace spaces with hyphens
            .replace(/-+/g, "-") // Remove multiple hyphens
            +
            "-" + uuidv4().substring(0, 7);
        console.log(randomId);

        // image (req.file access -> multer)
        const image = req.file;

        // check user with id creator exists
        const author = await User.findById(creator)

        // validations
        if (!image) {
            return res.status(400).json({
                "success": false,
                "message": "Please select the image"
            })
        }
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

        // cloudinary image url
        // public id delete karne ke liye chahiye hogi
        const { secure_url, public_id } = await cloudinaryImageUpload(image.path);

        // cloudinary mei upload ho jaane ke baad image ko uploads folder se hata do
        fs.unlinkSync(image.path);



        // yaha pr image:url bhi aayega, image multer se aa rahi hogi
        const blog = await Blog.create({ title, description, draft, creator, image: secure_url, imageId: public_id, blogId: randomId });

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

// update blog  controller
async function updateBlog(req, res) {
    try {
        // update blog
        const { title, description, draft } = req.body;

        // multer
        const image = req.file;
        // console.log(image);


        // extract id from params
        const { id } = req.params;

        // blog by id
        const blog = await Blog.findOne({ blogId: id });

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

        // image change -> file otherwise undefined
        if (image) {
            // old image haat do cloudinary se
            await cloudinaryDestroyImage(blog.imageId);
            // new image upload kardo cloudinary par
            let { secure_url, public_id } = await cloudinaryImageUpload(image.path);
            // update image and imageId from DB
            blog.image = secure_url;
            blog.imageId = public_id;

            // after new image cloudinary upload -> upload folder se hata do
            fs.unlinkSync(image.path);
        }

        // set other values
        blog.title = title
        blog.description = description
        blog.draft = draft

        // save updated blog in DB
        const updatedBlog = await blog.save();


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

// delete blog controller
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

        // cloudinary se bhi hata do
        await cloudinaryDestroyImage(blog.imageId);


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

// like blog controller
async function likeBlog(req, res) {
    try {
        // blog id
        const { id } = req.params;

        // find blog by id
        const blog = await Blog.findOne({ blogId: id });
        // creator refers to the authenticated user (not the one creating the blog)
        const creator = req.user;


        // validation
        // blog id valid?
        if (!blog) {
            return res.status(400).json({
                "success": false,
                "message": "Blog does not exits",
            })
        }
        // user id exists in like array -> dislike else like
        if (!blog.likes.includes(creator)) {
            // like blog logic
            // push user id to like array
            await Blog.findOneAndUpdate({ blogId: id }, { $push: { likes: creator } });


            // response message
            return res.status(200).json({
                "success": true,
                "message": "Blog liked successfully...",
                "isLiked": true,
                blog
            })

        } else {
            // dislike blog logic
            // pull user id to like array
            await Blog.findOneAndUpdate({ blogId: id }, { $pull: { likes: creator } })



            // response message
            return res.status(200).json({
                "success": true,
                "message": "Blog disliked successfully...",
                "isLiked": false,
            })
        }
    } catch (err) {
        return res.status(500).json({
            "success": false,
            "message": "Error liking blog",
            "error": err.message
        })
    }
}



module.exports = {
    getBlogs,
    getBlog,
    createBlog,
    updateBlog,
    deleteBlog,
    likeBlog
};