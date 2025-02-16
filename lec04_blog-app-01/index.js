// import express
const express = require("express");

let blogs = [];

// create server
const app = express();

// middleware
app.use(express.json());

// routes

// get blogs
app.get("/blogs", (req, res) => {
    // get the blogs
    res.json({ "message": "Blog fetched successfully,", blogs })
});

// get particular blog (with id)
app.get("/blogs/:id", (req, res) => {
    // find index
    const index = blogs.findIndex(blog => blog.id == Number(req.params.id))

    // get the blogs
    res.json({ "message": "Blog fetched successfully", blogs: blogs[index] })
});

// create blogs
app.post("/blogs", (req, res) => {
    const { title, content, description, name } = req.body;

    // error handling
    if (!title) {
        res.send("Enter title")
    }
    if (!content) {
        res.send("Enter content")
    }
    if (!description) {
        res.send("Enter description")
    }
    if (!name) {
        res.send("Enter name")
    }

    // push to blog
    blogs.push({...req.body, id: blogs.length + 1 })

    // success message
    res.status(200).json({ "message": "Blog created successfully" });

});

// update blogs
app.put("/blogs/:id", (req, res) => {


    // index find karo
    // dhyaan rakhna comparison karte waqt req.param waali id string mei hai
    const index = blogs.findIndex(blog => blog.id == Number(req.params.id))

    // update kardo uss index par

    // check if the blog exists
    if (index === -1) {
        return res.status(404).json({ "message": "Blog not found" });
    }

    // update the blog at the found index
    blogs[index] = {...blogs[index], ...req.body };

    // success message
    res.status(200).json({ "message": "Blog updated successfully" });
});

// delete blogs
app.delete("/blogs/:id", (req, res) => {

    // filter kardo joh blog id se match naa kare
    const filteredBlogs = blogs.filter(blog => blog.id != Number(req.params.id));

    // clone kar do updated array
    blogs = filteredBlogs;
    // success message
    res.status(200).json({ "message": "Blog deleted successfully" });
});


// listen to server
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});