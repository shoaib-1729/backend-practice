import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const HomePage = () => {
    const [data, setData] = useState([]);

    // page load hote hi -> fetch blogs
    useEffect(() => {
        getBlogs();
    }, []);
    
    async function getBlogs(){
        const res = await axios.get("http://localhost:3000/api/v1/blogs");
        // console.log(res);
        setData(res.data.blogs);
    }
    
    // Helper function to format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        // Example: "3/25/2025, 1:00:00 PM"
        return date.toLocaleString();
    }
    



    return (
        <div className="container mx-auto p-6">
            {/* Mapping through the blogs */}
            {
            data.map(blog => (
            <Link key={blog._id} to={`/blog/${blog.blogId}`}>
                <div  className="flex justify-between bg-white shadow-lg rounded-lg p-6 mb-6">
                    {/* Left Side: Blog Content */}
                    <div className="flex-1 mr-6">
                        {/* Blog Creator */}
                        <p className="text-gray-500 text-sm">{blog.creator.name}</p>

                        {/* Blog Title */}
                        <h1 className="text-3xl font-semibold text-gray-900 mt-2 mb-4">{blog.title}</h1>

                        {/* Blog Description */}
                        <h3 className="text-xl text-gray-700 mb-4">{blog.description}</h3>

                        {/* Icons & Meta Information */}
                        <div className="flex items-center text-gray-500 space-x-4">
                            <p className="cursor-pointer hover:text-gray-700">Save</p>
                            {/* Convert `createdAt` to human-readable */}
                            <p>Created at: {formatDate(blog.createdAt)}</p>
                        </div>
                    </div>

                    {/* Right Side: Blog Image */}
                    <div className="w-1/3">
                        <img
                            src={blog.image} 
                            alt="Blog Image"
                            className="w-full h-auto rounded-lg shadow-md"
                        />
                    </div>
                </div>
            </Link>

            )
    )}
        </div>
)};

export default HomePage;
