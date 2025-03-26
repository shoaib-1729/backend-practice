import axios from "axios";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom"

const BlogPage = () => {
    // data
    const [blog, setBlog] = useState(null);
    
    // params
    const {id} = useParams();


    async function fetchBlog() {
        try {
            const res = await axios.get(`http://localhost:3000/api/v1/blogs/${id}`)
            setBlog(res.data.blog);
        } catch (err) {
            console.error("Error fetching blog: ", err);     
        }
    }

    // page load -> api call
    useEffect(() => {
        fetchBlog()
    }, [id]);




    return(
        <div>
            {
                !blog ? <h1>Loading...</h1> :(
                        <div key={blog._id} className="flex justify-between bg-white shadow-lg rounded-lg p-6 mb-6">
                          <div className="flex-1 mr-6">
                            {/* Blog Creator */}
                             <p className="text-gray-500 text-sm">{blog.creator.name}</p>
    
                            {/* Blog Title */}
                             <h1 className="text-3xl font-semibold text-gray-900 mt-2 mb-4">{blog.title}</h1>
    
                            {/* Blog Description */}
                             <h3 className="text-xl text-gray-700 mb-4">{blog.description}</h3>
                         </div>
    
                        {/* Right Side: Blog Image */}
                        <div className="w-1/3">
                            <img
                                src={blog.image} 
                                alt="Blog-Image"
                                className="w-full h-auto rounded-lg shadow-md"
                            />
                        </div>
                    </div>
                    )
            }
        </div>
    )
}

export default BlogPage