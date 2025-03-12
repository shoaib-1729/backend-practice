const mongoose = require("mongoose");
const Blog = require("../models/blogModel.js")
const User = require("../models/userModel.js");
const Comment = require("../models/commentModel.js")

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
        // draft false ->  only accessed by blog author, authorization will be required
        const blog = await Blog.findById(req.params.id).populate({
            path: "comments",
            // populate user inside comments (nested populate)
            // populating user because username is required for displaying above the comment
            populate: {
                path: "user",
                select: "name email"
            }
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

// update blog  controller
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

        // Check if the id is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        // find blog by id
        const blog = await Blog.findById(id);
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
            await Blog.findByIdAndUpdate(id, { $push: { likes: creator } })


            // response message
            return res.status(200).json({
                "success": true,
                "message": "Blog liked successfully..."
            })

        } else {
            // dislike blog logic
            // pull user id to like array
            await Blog.findByIdAndUpdate(id, { $pull: { likes: creator } })



            // response message
            return res.status(200).json({
                "success": true,
                "message": "Blog disliked successfully..."
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

// add comment controller
async function addComment(req, res) {
    try {
        // blog id
        const { id } = req.params;
        // find blog by id
        const blog = await Blog.findById(id);
        // creator refers to the authenticated user (not the one creating the blog)
        const creator = req.user;

        // comment text  -> request body
        const { comment } = req.body

        // Check if the id is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }


        // validation
        // blog id valid?
        if (!blog) {
            return res.status(400).json({
                "success": false,
                "message": "Blog does not exits",
            })
        }

        // no comment
        if (!comment) {
            return res.status(400).json({
                "success": false,
                "message": "Please enter the comment",
            })
        }


        // add comment after validation

        // create comment
        const newComment = await Comment.create({
            comment,
            blog: id,
            user: creator

        })

        // push comment in DB
        await Blog.findByIdAndUpdate(id, { $push: { comments: newComment._id } })


        // response message
        return res.status(200).json({
            "success": true,
            "message": "Comment added successfully..."
        })

    } catch (err) {
        return res.status(500).json({
            "success": false,
            "message": "Error commenting blog",
            "error": err.message
        })
    }
}


async function deleteComment(req, res) {
    try {
        // delete comment -> pass comment id to delete in route
        const { id: commentId } = req.params;

        // user id
        const userId = req.user;

        // Check if the commentId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        // find the comment and populate blog details
        const comment = await Comment.findById(commentId).populate({
            path: "blog",
            select: "creator comments"
        });

        // Check if the comment exists
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        // validation

        // check if the one deleting the comment is the creator of the comment or the blog
        if (comment.user != userId && comment.blog.creator != userId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized for this action",
            });
        }

        // check if the comment exists in the blog's comments array
        if (!comment.blog.comments.includes(commentId)) {
            return res.status(400).json({
                success: false,
                message: "Comment does not exist in this blog",
            });
        }

        // delete comment -> remove the comment id from the blog's comments array
        await Blog.findByIdAndUpdate(comment.blog._id, { $pull: { comments: commentId } });

        // delete the comment document from the Comment model
        await Comment.findByIdAndDelete(commentId);

        // response message
        return res.status(200).json({
            success: true,
            message: "Comment deleted successfully"
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error deleting comment",
            error: err.message
        });
    }
}


module.exports = {
    getBlogs,
    getBlog,
    createBlog,
    updateBlog,
    deleteBlog,
    likeBlog,
    addComment,
    deleteComment
}