import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
// import { useNavigate } from "react-router-dom";

const AddBlog = () => {
    // token
    const token = localStorage.getItem("token");

    // navigate
    // const navigate = useNavigate();


    const [blogData, setBlogData] = useState({
        "title":"",
        "description":"",
        "image":""
        })

        // Handle form data
  const handleBlogData = (e) => {
    const { name, value, files } = e.target;
    // console.log(name, value, files);
    // console.log(blogData);



    // Check if it's a file input
    if (name === "image") {
      setBlogData((prevData) => ({
        ...prevData,
        [name]: files[0], // Set the file to state
      }));
    } else {
      setBlogData((prevData) => ({
        ...prevData,
        [name]: value, // For text inputs
      }));
    }
  };

    // form submit pr db call karwao -> create blog
    async function handlePostBlog(e){
        try{
            e.preventDefault();
           const res =  await axios.post("http://localhost:3000/api/v1/blogs", blogData, 
                {
                    headers:{
                        "Content-Type":"multipart/form-data",
                        Authorization: `Bearer ${token}`
                    }
                }
            )
                console.log(res);
                // redirect to home page
                if(res.status == 200){
                    toast.success(res.data.message)
                    // navigate -> home page
                    // navigate("/")
        
                }

        }catch(err){
            toast.error(err.response.data.message)
            console.log("Error posting blog", err)
        }

    }

    return (
      <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">Add Blog</h1>
        <form className="space-y-4" onSubmit={handlePostBlog}>
          <div>
            <label htmlFor="title" className="block text-lg font-medium text-gray-700">
              Title
            </label>
            <input
              id="title"
              type="text"
              name="title"
              onChange={(handleBlogData)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-lg font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              onChange={handleBlogData}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
            />
          </div>
          <div>
            <label htmlFor="image" className="block text-lg font-medium text-gray-700">
              Image
            </label>
            <input
              id="image"
              type="file"
              name="image"
              onChange={handleBlogData}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Post Blog
            </button>
          </div>
        </form>
      </div>
    );
  };
  
  export default AddBlog;
  