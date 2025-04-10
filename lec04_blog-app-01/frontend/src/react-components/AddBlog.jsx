import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";


const AddBlog = () => {
  const [blogData, setBlogData] = useState({
      title:"",
      description:"",
      image:null
      })

  const {id} = useParams()

    // user data from store
    const {token} = useSelector((slice) => slice.user);

    // blog slice data from store
    const {title, description, image} = useSelector((slice) => slice.selectedBlog);

    // navigate
    const navigate = useNavigate();

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

  // page load hote hi blog ka data fetch karo -> edit waale case mei
  useEffect(()=> {
    if(id){
      fetchBlogData()
    }
  }, [id])

  async function fetchBlogData(){
    // try{
      // const res = await axios.get(`http://localhost:3000/api/v1/blog/${id}`)
      // set kardo state par
      setBlogData({
        title: title,
        description: description,
        image: image
      });

    // }catch(err){
    //   // toast.error(err.response.data.message || err.response.data.error)
    //   toast.error(err.response.data.message)
    //   console.log("Error posting blog", err)
    // }
  };

  // handle edit blog
  async function handleEditBlog(e){
    try{
      e.preventDefault();
      // console.log(typeof(blogData.image))
      // console.log(blogData.image)
      const res = await axios.put(`http://localhost:3000/api/v1/blogs/${id}`, blogData,
        {
          headers:{
              "Content-Type":"multipart/form-data",
              Authorization: `Bearer ${token}`
          }
      }
  )
  console.log(blogData);

  //  redirect to home page
   if(res.status == 200){
    toast.success(res.data.message)
    // navigate -> home page
    navigate("/")
   }
}catch(err){
      toast.error(err.response.data.message)
      console.log("Error posting blog", err)
  }

  }

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
                // console.log(blogData);

                // redirect to home page
                if(res.status == 200){
                    toast.success(res.data.message)
                    // navigate -> home page
                    navigate("/")
        
                }

        }catch(err){
            toast.error(err.response.data.message)
            console.log("Error posting blog", err)
        }

    }


    return (
      <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        {id ? "Edit Blog" : "Add Blog"}
        </h1>
        <form className="space-y-4" onSubmit={id ? handleEditBlog : handlePostBlog}>
          <div>
            <label htmlFor="title" className="block text-lg font-medium text-gray-700">
              Title
            </label>
            <input
              id="title"
              type="text"
              name="title"
              value={blogData.title}
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
              value={blogData.description}
              onChange={handleBlogData}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
            />
          </div>
          <div>
           <div>
             <label htmlFor="image" className="text-lg font-medium text-gray-700">
               {
                 blogData.image ? <img src={typeof(blogData.image)=="string" ? blogData.image : URL.createObjectURL(blogData.image)} alt="Preview-Image" />
                 : (
                  <div className="bg-slate-200 m-2 p-15 rounded-md  w-lg h-lg flex justify-center items-center">Select Image</div>
                )
              }
             </label>
             <input
              id="image"
              accept=".png, .jpg, .jpeg"
              type="file"
              name="image"
              placeholder="Select Image"
              onChange={handleBlogData}
              className="hidden w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {/* id undefined hai toh post blog, else edit */}
              {id ? "Edit Blog" : "Add Blog"}
            </button>
          </div>
        </form>
      </div>
    );
  };
  
  export default AddBlog;
  