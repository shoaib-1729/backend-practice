const mongoose = require("mongoose");
const fs = require("node:fs");
const Blog = require("../models/blogModel.js")
const Comment = require("../models/commentModel.js")
const User = require("../models/userModel.js");
const { v4: uuidv4 } = require('uuid');
const { cloudinaryImageUpload, cloudinaryDestroyImage } = require("../config/cloudinaryConfig.js");

// get all blogs controller
async function getBlogs(req, res) {
    try {
        const pageNo = Number(req.query.pageNo);
        const limit = Number(req.query.limit);

        const skip = (pageNo - 1) * limit;

        const totalBlogs = await Blog.countDocuments({ draft: false })
        const hasMoreBlogs = totalBlogs > (skip + limit)
            // console.log(hasMoreBlogs)

        const blogs = await Blog.find({ "draft": false }).populate({
                path: "creator",
                select: "-password"
            }).populate({
                path: "likes",
                select: "name email"
            })
            .skip(skip)
            .limit(limit)


        return res.json({
            "success": true,
            "message": "Blogs fetched successfully...",
            blogs,
            hasMoreBlogs
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
                select: "name email followers username"
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

        const { title, description } = req.body;

        const draft = (req.body.draft === "true") ? true : false

        const content = JSON.parse(req.body.content);
        const tag = JSON.parse(req.body.tag);

        // console.log(tag);
        console.log(draft);

        const { image, images } = req.files;

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
        if (!tag) {
            return res.status(404).json({
                "success": false,
                "message": "Please add tag"
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

            if (block.type == "image" && block.data.file.image) {
                const { secure_url, public_id } = await cloudinaryImageUpload(
                    `data:image/jpeg;base64,${images[imageIndex].buffer.toString("base64")}`
                );

                // Only update URL & imageId, rest untouched
                block.data.file.url = secure_url;
                block.data.file.imageId = public_id;

                // caption ko untouched chhod do
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
            content,
            tag,
            draft,
        };

        // only set draft is user sent it
        // if (typeof draft !== "undefined") {
        //     blogData.draft = draft;
        // }

        // yaha pr image:url bhi aayega, image multer se aa rahi hogi
        const blog = await Blog.create(blogData);


        // blog create -> add blogs in user collection
        await User.findByIdAndUpdate(creator, { $push: { blogs: blog._id } });

        // agar draft true hai yeh dikhaao
        if (draft) {
            return res.status(200).json({
                "success": true,
                "message": "Blog saved as draft. You can publish or edit it anytime from your settings."
            })
        }


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
        const { title, description } = req.body;

        const draft = (req.body.draft === "true") ? true : false

        console.log(draft)
        const tag = JSON.parse(req.body.tag);



        const content = JSON.parse(req.body.content);
        const existingImages = JSON.parse(req.body.existingImages);


        // multer
        const { image, images } = req.files;
        // console.log(image, images);


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
                const block = content.blocks[i];

                if (block.type === "image" && block.data.file.image) {
                    const { secure_url, public_id } = await cloudinaryImageUpload(
                        `data:image/jpeg;base64,${images[imageIndex].buffer.toString("base64")}`
                    );

                    // ✅ Correct fix
                    block.data.file.url = secure_url;
                    block.data.file.imageId = public_id;

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
        blog.tag = tag;
        blog.draft = draft;

        // set only if user send it
        // if (typeof draft !== "undefined") {
        //     blog.draft = draft;
        // }

        // save updated blog in DB
        const updatedBlog = await blog.save();


        // agar draft true hai yeh dikhaao
        if (draft) {
            return res.status(200).json({
                "success": true,
                "message": "Blog saved as draft. You can publish or edit it anytime from your settings."
            })
        }


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
        const blog = await Blog.findById(id);
        // creator refers to the authenticated user (not the one creating the blog)
        const userId = req.user;


        // validation
        // blog id valid?
        if (!blog) {
            return res.status(400).json({
                "success": false,
                "message": "Blog does not exits",
            })
        }
        // user id exists in like array -> dislike else like
        if (!blog.likes.includes(userId)) {
            // push user id to like array
            await Blog.findByIdAndUpdate(id, { $push: { likes: userId } });
            // user model mei bhi push karo
<<<<<<< HEAD
            const user = await User.findByIdAndUpdate(userId, { $push: { likedBlogs: id } }, { new: true })
=======
            await User.findByIdAndUpdate(userId, { $push: { likedBlogs: id } })
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed



            // response message
            return res.status(200).json({
                "success": true,
                "message": "Blog liked successfully...",
                "isLiked": true,
<<<<<<< HEAD
                blog,
                user,
=======
                blog
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
            })

        } else {
            // dislike blog logic
            // pull user id to like array
            await Blog.findByIdAndUpdate(id, { $pull: { likes: userId } })
                // user se bhi pull karo
<<<<<<< HEAD
            const updatedUser = await User.findByIdAndUpdate(userId, { $pull: { likedBlogs: id } }, { new: true })
=======
            await User.findByIdAndUpdate(userId, { $pull: { likedBlogs: id } })
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed



            // response message
            return res.status(200).json({
                "success": true,
                "message": "Blog disliked successfully...",
                "isLiked": false,
<<<<<<< HEAD
                "user": updatedUser
=======
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
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


// save blog controller
async function saveBlog(req, res) {
    try {
        // blog id
        const { id } = req.params;

        // find blog by id
        const blog = await Blog.findById(id);
        const userId = req.user;


        // validation
        if (!blog) {
            return res.status(400).json({
                "success": false,
                "message": "Blog does not exits",
            })
        }
        // user id exists in save array -> dislike else save
        if (blog.savedBy && !blog.savedBy.includes(userId)) {
            // push user id to save array
<<<<<<< HEAD
            await Blog.findByIdAndUpdate(id, { $push: { savedBy: userId } });
            // user model mei bhi push karo
            const updatedUser = await User.findByIdAndUpdate(userId, { $push: { savedBlogs: id } }, { new: true })
=======
            await Blog.findByIdAndUpdate(id, { $set: { savedBy: userId } });
            // user model mei bhi push karo
            await User.findByIdAndUpdate(userId, { $set: { savedBlogs: id } })
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed



            // response message
            return res.status(200).json({
                "success": true,
                "message": "Blog saved successfully...",
                "isLiked": true,
<<<<<<< HEAD
                blog,
                user: updatedUser,
=======
                blog
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
            })

        } else {
            // unsave blog logic
            // pull user id to save array
<<<<<<< HEAD
            await Blog.findByIdAndUpdate(id, { $pull: { savedBy: userId } })
                // user se bhi pull karo
            const updatedUser = await User.findByIdAndUpdate(userId, { $pull: { savedBlogs: id } }, { new: true })
=======
            await Blog.findByIdAndUpdate(id, { $unset: { savedBy: userId } })
                // user se bhi pull karo
            await User.findByIdAndUpdate(userId, { $unset: { savedBlogs: id } })
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed



            // response message
            return res.status(200).json({
                "success": true,
                "message": "Blog unsaved successfully...",
                "isLiked": false,
<<<<<<< HEAD
                user: updatedUser,
=======
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
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

async function fetchSearchedBlog(req, res) {
    try {
        const { q } = req.query;

        const words = q.split(" ");

        const regexQueries = words.map(word => ({
            $or: [
                { title: { $regex: word, $options: "i" } },
                { description: { $regex: word, $options: "i" } },
                { tag: { $regex: word, $options: "i" } },
            ]
        }));


        const pageNo = Number(req.query.pageNo);
        const limit = Number(req.query.limit);
        const skip = (pageNo - 1) * limit;

        const blogs = await Blog.find({ $or: regexQueries }, { draft: false })
            .skip(skip)
            .limit(limit)

        const totalBlogs = await Blog.countDocuments({ $or: regexQueries }, { draft: false })
        const hasMoreBlogs = totalBlogs > (skip + limit)



        return res.status(200).json({
            "success": true,
            "message": "Blog fetched successfully",
            blogs,
            blogCount: totalBlogs,
            hasMoreBlogs,
        })


    } catch (err) {
        return res.status(500).json({
            "success": false,
            "message": "Error searching blog",
            "error": err.message
        })
    }
}

// tag search controller
async function fetchTaggedBlog(req, res) {
    try {
        const { tagName } = req.params;

        const { exclude } = req.query;

        if (exclude) {
            const blogs = await Blog.find({
                    tag: {
                        $in: [tagName],
                    },
                    blogId: { $ne: exclude }
                }, { draft: false })
                .skip(skip)
                .limit(limit)

            const totalBlogs = await Blog.countDocuments({
                tag: {
                    $in: [tagName]
                },
                blogId: { $ne: exclude }
            }, { draft: false })


            return res.status(200).json({
                "success": true,
                "message": "Blog fetched successfully",
                blogs,
                blogCount: totalBlogs,
                hasMoreBlogs,
            })
        }



        // const regexQueries = words.map(word => ({
        //     $or: [
        //         { tag: { $regex: word, $options: "i" } },
        //     ]
        // }));


        const pageNo = Number(req.query.pageNo);
        const limit = Number(req.query.limit);
        const skip = (pageNo - 1) * limit;

        const blogs = await Blog.find({
                tag: {
                    $in: [tagName],
                },
                // blogId: { $ne: exclude }
            }, { draft: false })
            .skip(skip)
            .limit(limit)




        const totalBlogs = await Blog.countDocuments({
            tag: {
                $in: [tagName]
            },
            // blogId: { $ne: exclude }
        }, { draft: false })
        const hasMoreBlogs = totalBlogs > (skip + limit)



        return res.status(200).json({
            "success": true,
            "message": "Blog fetched successfully",
            blogs,
            blogCount: totalBlogs,
            hasMoreBlogs,
        })


    } catch (err) {
        return res.status(500).json({
            "success": false,
            "message": "Error searching blog",
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
    likeBlog,
    saveBlog,
    fetchSearchedBlog,
    fetchTaggedBlog
};