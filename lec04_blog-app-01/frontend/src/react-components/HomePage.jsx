import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const HomePage = () => {
    const [data, setData] = useState([]);

    // Fetch blogs when the page loads
    useEffect(() => {
        getBlogs();
    }, []);
    
    async function getBlogs() {
        const res = await axios.get("http://localhost:3000/api/v1/blogs");
        setData(res.data.blogs);
    }

    // Helper function to format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    return (
        <div className="container mx-auto p-6">
            {/* Mapping through the blogs */}
            {
                data.map(blog => (
                    <Link key={blog._id} to={`/blog/${blog.blogId}`}>
                        <div className="flex justify-between bg-white shadow-lg rounded-xl p-6 mb-6 hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                            {/* Left Side: Blog Content */}
                            <div className="flex-1 mr-6">
                                {/* Blog Creator */}
                                <p className="text-sm text-gray-600 mb-2">{blog.creator.name}</p>

                                {/* Blog Title */}
                                <h1 className="text-3xl font-semibold text-gray-900 mb-4 hover:text-blue-600 transition-colors">{blog.title}</h1>

                                {/* Blog Description */}
                                <h3 className="text-xl text-gray-700 mb-6">{blog.description}</h3>

                                {/* Icons & Meta Information */}
                                <div className="flex items-center text-gray-500 space-x-6">
                                    {/* Created at */}
                                    <p className="text-sm">{formatDate(blog.createdAt)}</p>

                                    {/* Like and Comment Section */}
                                    <div className="flex items-center space-x-4 ml-auto">
                                        {/* Like Icon and Count */}
                                        <div className="flex items-center space-x-2">
                                            <i
                                                className={`fi fi-rr-social-network text-2xl cursor-pointer`}  // Smaller icon
                                            ></i>
                                            <p className="text-sm font-semibold text-gray-700">
                                                {blog.likes.length}
                                            </p>
                                        </div>

                                        {/* Comment Icon */}
                                        <div className="flex items-center space-x-2">
                                            <i className="fi fi-sr-comment-alt text-2xl cursor-pointer"></i>
                                            <p className="text-sm font-semibold text-gray-700">0</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Blog Image */}
                            <div className="w-1/3">
                                <img
                                    src={blog.image}
                                    alt="Blog Image"
                                    className="w-full h-auto rounded-lg shadow-md transition-transform duration-300 transform hover:scale-105"
                                />
                            </div>
                        </div>
                    </Link>
                ))
            }
        </div>
    );
};

export default HomePage;
