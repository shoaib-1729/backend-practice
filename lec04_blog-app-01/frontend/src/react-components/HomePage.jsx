import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { formatDate } from "../utils/formatDate"

const HomePage = () => {
    const [data, setData] = useState([]);


    console.log("Home page rendered....")

    
    async function getBlogs() {
        try {
          console.log("Calling API...");
          const res = await axios.get("http://localhost:3000/api/v1/blogs");
          console.log("Fetched Blogs:", res.data.blogs);
          setData(res.data.blogs);
        } catch (err) {
            console.error("Failed to fetch blogs", err);
        }
    }
    
    useEffect(() => {
        console.log("HomePage useEffect triggered");
            getBlogs();
      }, []);

    return (
        <div className="max-w-2xl mx-auto px-4 py-10">
            <div className="flex flex-col">
                {data.map((blog) => (
                    <Link
                        key={blog._id}
                        to={`/blog/${blog.blogId}`}
                        className="flex flex-col sm:flex-row items-start gap-6 py-6 border-b-1 border-gray-300"
                    >
                        {/* Text Content */}
                        <div className="flex-1">
                            {/* Author Name */}
                            <p className="text-sm text-gray-500 mb-1">
                                {blog.creator.name}
                            </p>

                            {/* Title */}
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight line-clamp-2">
                                {blog.title}
                            </h2>

                            {/* Description */}
                            <p className="text-gray-700 mt-2 text-sm sm:text-base line-clamp-2">
                                {blog.description}
                            </p>

                            {/* Meta: Date, Likes, Comments */}
                            <div className="flex items-center text-xs text-gray-500 mt-4 gap-4">
                                <span>{formatDate(blog.createdAt)}</span>
                                <div className="flex items-center gap-1">
                                    <i className="fi fi-rr-social-network text-sm text-gray-500"></i>
                                    <span>{blog.likes.length}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <i className="fi fi-sr-comment-alt text-sm text-gray-500"></i>
                                    <span>{blog.comments?.length || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Blog Image */}
                        <img
                            src={blog.image}
                            alt={blog.title}
                            className="w-full sm:w-40 h-32 object-cover rounded-md shadow-sm"
                        />
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default HomePage;