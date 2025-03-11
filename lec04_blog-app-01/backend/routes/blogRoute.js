const express = require("express");
const verifyUser = require("../middlewares/auth.js");
const { getBlog, getBlogs, createBlog, updateBlog, deleteBlog } = require("../controllers/blogController.js");
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

// export router
module.exports = router;