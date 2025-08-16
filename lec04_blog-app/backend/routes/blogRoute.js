const express = require("express");
const verifyUser = require("../middlewares/auth.js");
const {
    getBlogById,
    getBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
    likeBlog,
    saveBlog,
    fetchSearchedBlog,
    fetchTaggedBlog,
} = require("../controllers/blogController.js");
const {
    addComment,
    deleteComment,
    editComment,
    likeComment,
    addNestedComment
} = require("../controllers/commentController.js");
const upload = require("../utils/multer.js");

const router = express.Router();

// get blogs
router.get("/blogs", getBlogs);

// get particular blog (with id)
router.get("/blogs/:id", getBlogById);

// create blogs
// verify user => create blog
router.post(
    "/blogs",
    verifyUser,
    upload.fields([{ name: "image" }, { name: "images" }]),
    createBlog
);

// update blogs
router.put(
    "/blogs/:id",
    verifyUser,
    upload.fields([{ name: "image" }, { name: "images" }]),
    updateBlog
);

// delete blogs
router.delete("/blogs/:id", verifyUser, deleteBlog);

// likes
router.post("/blogs/like/:id", verifyUser, likeBlog);

// add comment
router.post("/blogs/comment/:id", verifyUser, addComment);

// delete comment
router.delete("/blogs/comment/:id", verifyUser, deleteComment);

// edit comment
router.put("/blogs/edit-comment/:id", verifyUser, editComment);

// like comment
router.patch("/blogs/like-comment/:id", verifyUser, likeComment);

// add nested comment (reply)
router.post("/comment/:parentCommentId/:id", verifyUser, addNestedComment);

// searched blog
router.get("/search-query", fetchSearchedBlog)

// searched blog
router.get("/tag/:tagName", fetchTaggedBlog)

// save blogs
router.patch("/save-blog/:id", verifyUser, saveBlog)

// export router
module.exports = router;