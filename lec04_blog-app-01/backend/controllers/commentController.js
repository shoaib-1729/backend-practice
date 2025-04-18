const mongoose = require("mongoose");
const Comment = require("../models/commentModel.js")
const Blog = require("../models/blogModel.js")

//  add comment controller
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
            .then((comment) => {
                return comment.populate({
                    path: "user",
                    select: "name email"
                })
            })

        // push comment in blog
        await Blog.findByIdAndUpdate(id, { $push: { comments: newComment._id } })


        // response message
        return res.status(200).json({
            "success": true,
            "message": "Comment added successfully...",
            newComment
        })

    } catch (err) {
        return res.status(500).json({
            "success": false,
            "message": "Error commenting blog",
            "error": err.message
        })
    }
}

// delete comment controller
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

        // console.log(comment);

        // Check if the comment exists
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        // validation

        // delete comment -> author of the comment, creator of the blog
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

// update comment controller
async function editComment(req, res) {
    try {
        // delete comment -> pass comment id to delete in route
        const { id: commentId } = req.params;

        // user id
        const userId = req.user;

        // update -> request body
        const { updatedComment } = req.body;

        // Check if the commentId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        // find the comment and populate blog details
        const comment = await Comment.findById(commentId).populate({
            path: "blog",
            select: "creator comments"
        });

        // console.log(comment);

        // Check if the comment exists
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        // validation

        // update comment -> author of the comment
        // check if the one deleting the comment is the creator of the comment
        if (comment.user != userId) {
            return res.status(403).json({
                success: false,
                message: "You are not valid user to edit this comment",
            });
        }

        // check if the comment exists in the blog's comments array
        if (!comment.blog.comments.includes(commentId)) {
            return res.status(400).json({
                success: false,
                message: "Comment does not exist in this blog",
            });
        }

        // update the comment document from the Comment model
        await Comment.findByIdAndUpdate(commentId, { comment: updatedComment })

        // response message
        return res.status(200).json({
            success: true,
            message: "Comment updated successfully"
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error deleting comment",
            error: err.message
        });
    }
}

// like comment controller
async function likeComment(req, res) {
    try {
        // blog id
        const { id: commentId } = req.params;

        // Check if the id is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        // find blog by id
        const comment = await Comment.findById(commentId);
        // creator refers to the authenticated user (not the one creating the blog)
        const userId = req.user;



        // validation
        // comment id valid?
        if (!comment) {
            return res.status(400).json({
                "success": false,
                "message": "Comment does not exits",
            })
        }

        // console.log(!comment.likes.includes(userId));

        // user id exists in like array -> dislike, else like
        if (!comment.likes.includes(userId)) {
            // push user id to like array
            await Comment.findByIdAndUpdate(commentId, { $push: { likes: userId } })


            // response message
            return res.status(200).json({
                "success": true,
                "message": "Comment liked successfully..."
            })

        } else {
            // dislike comment logic
            // pull user id to like array
            await Comment.findByIdAndUpdate(commentId, { $pull: { likes: userId } })



            // response message
            return res.status(200).json({
                "success": true,
                "message": "Comment disliked successfully..."
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
    addComment,
    deleteComment,
    editComment,
    likeComment
}