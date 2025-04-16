import axios from "axios";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/shadcn-components/ui/button";
import { removeSelectedBlog, addSelectedBlog, changeLikes } from "../utils/selectedBlogSlice";
import { useDispatch, useSelector } from "react-redux";
import { formatDate } from "../utils/formatDate"
import Comment from "../react-components/Comment"
import { setIsOpen } from "../utils/commentSlice"

const BlogPage = () => {
    const [blog, setBlog] = useState(null);
    const { id } = useParams();
    const [isLiked, setIsLiked] = useState(false);

    const { token, email, id: userId } = useSelector((state) => state.user);
    const { likes, comments } = useSelector((state) => state.selectedBlog);
    const { isOpen } = useSelector((state) => state.comment);
    const dispatch = useDispatch();

    async function fetchBlog() {
        try {
            const { data: { blog } } = await axios.get(`http://localhost:3000/api/v1/blogs/${id}`);
            setBlog(blog);
            dispatch(addSelectedBlog(blog));

            if (blog.likes.includes(userId)) {
                setIsLiked(true);
            }
        } catch (err) {
            console.error("Error fetching blog:", err);
        }
    }

    async function handleLike() {
        try {
            if (token) {
                setIsLiked((prev) => !prev);

                const res = await axios.post(
                    `http://localhost:3000/api/v1/blogs/like/${blog.blogId}`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                dispatch(changeLikes(userId));
                toast.success(res.data.message);
            }
        } catch (err) {
            console.error("Error liking blog:", err);
        }
    }

    useEffect(() => {
        fetchBlog();


        return () => {
            dispatch(setIsOpen(false));
            if (
                window.location.pathname !== `/edit/${id}` &&
                window.location.pathname !== `/blog/${id}`
            ) {
                dispatch(removeSelectedBlog());
            }
        };
    }, [id]);

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            {!blog ? (
                <h1>Loading...</h1>
            ) : (
                <div key={blog._id}>
                    {/* Title */}
                    <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">{blog.title}</h1>

                    {/* Author Info */}
                    <div className="flex items-center space-x-3 text-sm text-gray-600 mb-4">
                        {/* Todo: profile image aayegi yaha */}
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                            alt="author"
                            className="w-8 h-8 rounded-full"
                        />
                        <span className="font-medium">{blog.creator.name}</span>
                        <span>&middot;</span>
                        <span>{formatDate(blog.createdAt)}</span>
                    </div>

                    {/* Meta Separator */}
                    <hr className="border-gray-300 mb-6" />

                    {/* Image */}
                    <img
                        src={blog.image}
                        alt="Blog visual"
                        className="max-w-lg rounded-lg mb-6 shadow-sm"
                    />

                    {/* Description */}
                    <p className="text-lg text-gray-700 leading-relaxed mb-6">
                        {blog.description}
                    </p>

                    {/* Edit Button */}
                    {token && blog.creator.email === email && (
                        <div className="text-center mb-8">
                            <Link to={`/edit/${blog.blogId}`}>
                                <Button className="px-6 py-2">Edit</Button>
                            </Link>
                        </div>
                    )}

                    {/* Like & Comment */}
                    <div className="flex items-center space-x-6 border-t border-gray-300 pt-4">
                        {/* Like */}
                        <div className="flex items-center space-x-2 cursor-pointer" onClick={handleLike}>
                            <i className={`fi ${isLiked ? "fi-sr-thumbs-up" : "fi-rr-social-network"} text-xl hover:text-blue-500`}></i>
                            <span className="text-sm text-gray-700 font-medium">{likes.length}</span>
                        </div>

                        {/* Comment Icon */}
                        <div className="flex items-center space-x-2 cursor-pointer">
                            <i onClick={() => dispatch(setIsOpen())} className="fi fi-sr-comment-alt text-xl hover:text-blue-500"></i>
                            <span className="text-sm text-gray-700 font-medium">
                                { comments.length }
                            </span>
                        </div>
                    </div>

                    {/* Overlay Div */}
                {
                    isOpen && (
                    <div
                    onClick={() => dispatch(setIsOpen(false))}
                    className="fixed inset-0 bg-black/10 z-40"
                    style={{ width: "calc(100% - 400px)" }}
                    ></div>
                )}
                        
                   {/* Comment Box */}
                    {
                        isOpen && <Comment/>
                    }
                </div>
            )}
        </div>
    );
};

export default BlogPage;
