const express = require("express");
const { getBlog, getBlogs, createBlog, updateBlog, deleteBlog } = require("../controllers/blogController.js");
const router = express.Router();

// get blogs
router.get("/blogs", getBlogs);

// get particular blog (with id)
router.get("/blogs/:id", getBlog);

// create blogs
router.post("/blogs", createBlog);

// update blogs
router.put("/blogs/:id", updateBlog);

// delete blogs
router.delete("/blogs/:id", deleteBlog);

// export router
module.exports = router;