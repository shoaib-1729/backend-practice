const mongoose = require("mongoose");
const fs = require("node:fs");
const Blog = require("../models/blogModel.js")
const Comment = require("../models/commentModel.js")
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
            })
            .lean()

        async function populateReplies(comments) {
            for (const comment of comments) {
                let populatedComment = await Comment.findById(comment._id)
                    .populate({
                        path: "replies",
                        populate: {
                            path: "user",
                            select: "name email"
                        }
                    })
                    .lean();


                // set populated data to comment replies
                comment.replies = populatedComment.replies

                // populate reply ke bhi replies 
                // recursive base case
                if (comment.replies.length > 0) {
                    await populateReplies(comment.replies);
                }
            }
            return comments
        }

        blog.comments = await populateReplies(blog.comments)


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
        const content = JSON.parse(req.body.content);
        // console.log(draft);
        // console.log(req.body);
        // console.log(content);

        const { image, images } = req.files;
        // console.log(image);

        // blog id wala kaam karna hoga
        const randomId = title
            .trim() // Remove leading & trailing spaces
            .toLowerCase() // Convert to lowercase
            .replace(/[^a-zA-Z0-9\s]/g, "") // Remove special characters
            .replace(/\s+/g, "-") // Replace spaces with hyphens
            .replace(/-+/g, "-") // Remove multiple hyphens
            +
            "-" + uuidv4().substring(0, 7);
        //     console.log(randomId);



        //      check user with id creator exists
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
        if (!content) {
            return res.status(400).json({
                "success": false,
                "message": "Please enter the content"
            })
        }
        // creator not there -> early return
        if (!author) {
            return res.status(404).json({
                "success": false,
                "message": "Creator not found"
            })
        }

        // image upload cludinary pr
        // images -> content images

        let imageIndex = 0;
        for (let i = 0; i < content.blocks.length; i++) {
            // har block nikaalo
            const block = content.blocks[i];

            // check karo image waale ko
            if (block.type == "image") {
                // console.log("object")
                // console.log(images[imageIndex]);

                // cloudinary upload -> memory storage par image path nhi dega multer
                // use buffer for image upload, bahut bada data aayega yeh
                // console.log(images[imageIndex].buffer)

                // cloudinary image upload
                const { secure_url, public_id } = await cloudinaryImageUpload(
                    `data:image/jpeg;base64,${images[imageIndex].buffer.toString(
                      "base64"
                    )}`
                );

                // console.log(secure_url);
                // console.log(public_id);

                // url change kardo abb
                // public id for delete
                block.data.file = {
                        url: secure_url,
                        imageId: public_id
                    }
                    // jab image hogi tabhi index badhao
                imageIndex++;
            }
        }


        // main image bhi upload kardo cloudinary par
        // memory storage -> no file path given by multer -> use buffer to upload the file
        const { secure_url, public_id } = await cloudinaryImageUpload(
            `data:image/jpeg;base64,${image[0].buffer.toString("base64")}`
        );

        const blogData = {
            title,
            description,
            creator,
            image: secure_url,
            imageId: public_id,
            blogId: randomId,
            // content ke andar abb image bhi hogi
            content
        };

        // only set draft is user sent it
        if (typeof draft !== "undefined") {
            blogData.draft = draft;
        }

        // yaha pr image:url bhi aayega, image multer se aa rahi hogi
        const blog = await Blog.create(blogData);


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



        const content = JSON.parse(req.body.content);
        const existingImages = JSON.parse(req.body.existingImages);


        // multer
        const { image, images } = req.files;
        console.log(image, images);


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

        // image nikaalo joh cloudinary se delete karni hai
        let imagesToDelete = blog.content.blocks
            .filter((block) => block.type == "image")
            .filter(
                (block) => !existingImages.find(({ url }) => url == block.data.file.url)
            )
            .map((block) => block.data.file.imageId);

        // delete kardo abb
        if (imagesToDelete.length > 0) {
            await Promise.all(imagesToDelete.map(id => cloudinaryDestroyImage(id)));
        }

        // joh images add hui hai unko add karwao (same logic add image in blog content wala)
        // image upload cloudinary pr
        // images -> content images
        // agar images hai toh add karo
        if (images) {
            let imageIndex = 0;
            for (let i = 0; i < content.blocks.length; i++) {
                // har block nikaalo
                const block = content.blocks[i];

                // check karo jismei nayi image add hui hai
                if (block.type === "image" && block.data.file.image) {
                    // cloudinary upload -> memory storage par image path nhi dega multer
                    // use buffer for image upload, bahut bada data aayega yeh
                    // console.log(images[imageIndex].buffer)

                    // cloudinary image upload
                    const { secure_url, public_id } = await cloudinaryImageUpload(
                        `data:image/jpeg;base64,${images[imageIndex].buffer.toString(
                          "base64"
                        )}`
                    );

                    // url change kardo abb
                    block.data.file = {
                            url: secure_url,
                            imageId: public_id
                        }
                        // jab image hogi tabhi index badhao
                    imageIndex++;
                }
            }
        }



        // image change -> file otherwise undefined
        if (image) {
            // old image haat do cloudinary se
            await cloudinaryDestroyImage(blog.imageId);
            // new image upload kardo cloudinary par
            let { secure_url, public_id } = await cloudinaryImageUpload(
                `data:image/jpeg;base64,${image[0].buffer.toString("base64")}`
            );
            // update image and imageId from DB
            blog.image = secure_url;
            blog.imageId = public_id;
        }

        // set other values
        blog.title = title
        blog.description = description
        blog.content = content;

        // set only if user send it
        if (typeof draft !== "undefined") {
            blog.draft = draft;
        }

        // save updated blog in DB
        const updatedBlog = await blog.save();


        return res.status(200).json({
            "success": true,
            "message": "Blog updated successfully...",
            "blog": updatedBlog
        })
    } catch (err) {
        console.log(err);
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