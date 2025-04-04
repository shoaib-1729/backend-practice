import axios from "axios";
import { useState, useEffect } from "react";
import { Link, useParams} from "react-router-dom";
import { Button } from "@/components/ui/button";

const BlogPage = () => {
    const [blog, setBlog] = useState(null);
    const { id } = useParams();

    // user nikaalo local storage se
    const userData = JSON.parse(localStorage.getItem("user"))

    async function fetchBlog() {
        try {
            const res = await axios.get(`http://localhost:3000/api/v1/blog/${id}`);
            setBlog(res.data.blog);
        } catch (err) {
            console.error("Error fetching blog: ", err);
        }
    }

    useEffect(() => {
        fetchBlog();
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
                        {/* email login -> token;  */}
                        {userData && blog.creator.email === userData.email && <Button type="submit" className="w-1/2 md:w-1/3 py-2 px-6 mx-auto cursor-pointer">
                            Edit
                          </Button> 
                        }
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlogPage;
