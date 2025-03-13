const express = require("express");
const verifyUser = require("../middlewares/auth.js");
const { getBlog, getBlogs, createBlog, updateBlog, deleteBlog, likeBlog } = require("../controllers/blogController.js");
const { addComment, deleteComment, editComment, likeComment } = require("../controllers/commentController.js")

const router = express.Router();

// get blogs
router.get("/blogs", getBlogs);

// get particular blog (with id)
router.get("/blogs/:id", getBlog);

// create blogs
// verify user => create blog
router.post("/blogs", verifyUser, createBlog);

// update blogs
router.put("/blogs/:id", verifyUser, updateBlog);

// delete blogs
router.delete("/blogs/:id", verifyUser, deleteBlog);

// likes
router.post("/blogs/like/:id", verifyUser, likeBlog)

// add comment
router.post("/blogs/comment/:id", verifyUser, addComment)

// delete comment
router.delete("/blogs/comment/:id", verifyUser, deleteComment)

// edit comment
router.put("/blogs/edit-comment/:id", verifyUser, editComment)

// like comment
router.post("/blogs/like-comment/:id", verifyUser, likeComment)

// export router
module.exports = router;