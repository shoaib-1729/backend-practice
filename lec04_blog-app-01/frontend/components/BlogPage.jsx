import axios from "axios";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { removeSelectedBlog, addSelectedBlog, changeLikes } from "../src/utils/selectedBlogSlice";
import { useDispatch, useSelector } from "react-redux";

const BlogPage = () => {
    const [blog, setBlog] = useState(null);
    const { id } = useParams();

    // Like state (to handle toggling)
    const [isLiked, setIsLiked] = useState(false);

    // Redux: Token, Email, and likes (for authenticated user)
    const { token, email, id: userId } = useSelector((slice) => slice.user);
    const { likes } = useSelector((slice) => slice.selectedBlog);

    const dispatch = useDispatch();

    // Fetch blog details
    async function fetchBlog() {
        try {
            let {
                data: {blog},
            } = await axios.get(`http://localhost:3000/api/v1/blogs/${id}`);
            setBlog(blog);
            // Add the fetched blog to Redux
            dispatch(addSelectedBlog(blog));
            // if userId exits -> hit like
            // if(blog.likes.includes(userId)){
            //    setIsLiked((prev) => !prev)
            // }
        } catch (err) {
            console.log("Error fetching blog: ", err);
        }
    }

    // Handle like/dislike
    async function handleLike() {
        try {
            if (token) {
                setIsLiked((prev) => !prev)

                let res = await axios.post(
                    `http://localhost:3000/api/v1/blogs/like/${blog.blogId}`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
 
                // Update Redux store
                dispatch(changeLikes(userId));

                toast.success(res.data.message);
            }
        } catch (err) {
            console.log("Error liking blog", err);
        }
    }

    useEffect(() => {
        fetchBlog();


        // Cleanup on unmount
        return () => {
            if (!window.location.pathname.includes(`/edit/${id}`)) {
                dispatch(removeSelectedBlog());
            }
        };
    }, [id]);

    return (
        <div>
            {!blog ? (
                <h1>Loading...</h1>
            ) : (
                <div key={blog._id} className="bg-white shadow-lg rounded-lg p-6 mb-6 flex flex-col">
                    {/* Blog Content */}
                    <div className="flex justify-between">
                        <div className="flex-1 mr-6">
                            <p className="text-gray-500 text-sm">{blog.creator.name}</p>
                            <h1 className="text-3xl font-semibold text-gray-900 mt-2 mb-4">{blog.title}</h1>
                            <h3 className="text-xl text-gray-700 mb-4">{blog.description}</h3>
                        </div>

                        <div className="w-1/3">
                            <img
                                src={blog.image}
                                alt="Blog-Image"
                                className="w-full h-auto rounded-lg shadow-md"
                            />
                        </div>
                    </div>

                    {/* Edit Button */}
                    <div className="text-center mt-4">
                        <Link to={`/edit/${blog.blogId}`}>
                            {token && blog.creator.email === email && (
                                <Button type="submit" className="w-1/2 md:w-1/3 py-2 px-6 mx-auto cursor-pointer">
                                    Edit
                                </Button>
                            )}
                        </Link>
                    </div>

                    {/* Like and Comment Section */}
                    <div className="flex items-center mt-4 space-x-6">
                        {/* Like Icon */}
                        <div className="flex items-center">
                            <i
                                onClick={handleLike}
                                className={`fi ${isLiked ? 'fi-rr-social-network' : 'fi-sr-thumbs-up'} text-3xl cursor-pointer hover:text-blue-500 transition-colors`}
                            ></i>
                            <p className="ml-2 text-lg font-semibold">{likes.length}</p> {/* Like count */}
                        </div>

                        {/* Comment Icon */}
                        <div className="flex items-center">
                            <i className="fi fi-sr-comment-alt text-3xl cursor-pointer hover:text-blue-500 transition-colors"></i>
                            <p className="ml-2 text-lg font-semibold">0</p> {/* Comment count */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlogPage;
