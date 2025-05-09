import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import EditorjsList from "@editorjs/list";
import CodeTool from "@editorjs/code";
import Marker from "@editorjs/marker";
import Embed from "@editorjs/embed";
import ImageTool from "@editorjs/image";

const AddBlog = () => {
  const [blogData, setBlogData] = useState({
    title: "",
    description: "",
    image: null,
    content: "",
  });

  const { id } = useParams();
  const editorjsRef = useRef(null);
  const { token } = useSelector((slice) => slice.user);
  const { title, description, image, content } = useSelector(
    (slice) => slice.selectedBlog
  );
  const navigate = useNavigate();

  const handleBlogData = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setBlogData((prevData) => ({
        ...prevData,
        [name]: files[0],
      }));
    } else {
      setBlogData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  useEffect(() => {
    if (id) {
      setBlogData({
        title,
        description,
        image,
        content,
      });
    }
  }, [id, title, description, image, content]);

    // handle edit blog
    async function handleEditBlog(e){
      e.preventDefault(); 
      
      let formData = new FormData();
      formData.append("title", blogData.title);
      formData.append("description", blogData.description);
      formData.append("image", blogData.image);
      formData.append("content", JSON.stringify(blogData.content));
  
      // console.log(blogData);
      // console.log(JSON.parse(blogData.content));
      // for(let data of formData.entries()){
      //   console.log(data);
      // }
  
      // case-1 (if se handle hoga)
      // content edit, new image add
  
      // case-2 (else se handle hoga)
      // existing image (shown from DB) delete
      let existingImages = [];
  
   
      blogData.content.blocks.forEach((block) => {
        if (block.type === "image") {
          if (block.data.file.image) {
            formData.append("images", block.data.file.image);
          } else {
            existingImages.push({
              url: block.data.file.url,
              imageId: block.data.file.imageId,
            });
          }
        }
      });
  
      formData.append("existingImages", JSON.stringify(existingImages));
  
      console.log(existingImages);
  
      try{
        // console.log(typeof(blogData.image))
        // console.log(blogData.image)
        const res = await axios.put(`http://localhost:3000/api/v1/blogs/${id}`, formData,
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
      navigate("/", { replace: true });
     }
  }
  catch(err){
        toast.error(err.response.data.message)
        console.log("Error posting blog", err)
    }
  
    }

    // form submit pr db call karwao -> create blog
    async function handlePostBlog(e){
      e.preventDefault();
      let formData = new FormData();
      formData.append("title", blogData.title);
      formData.append("description", blogData.description);
      formData.append("content", JSON.stringify(blogData.content));
      formData.append("image", blogData.image);

      // console.log(JSON.parse(blogData.content));

      blogData.content.blocks.forEach((block) => {
        if(block.type === "image"){
          formData.append("images", block.data.file.image);
        }
      })

      // console.log(blogData)

        try{
            e.preventDefault();
             const res =  await axios.post("http://localhost:3000/api/v1/blogs", formData, 
                {
                    headers:{
                        "Content-Type":"multipart/form-data",
                        Authorization: `Bearer ${token}`
                    }
                }
            );

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



  const initializeEditorjs = () => {
    editorjsRef.current  = new EditorJS({
      holder: 'editorjs',
      placeholder: "Write your blog content here...",
      data: content,
      tools: {
        header: {
          class: Header,
          inlineToolbar: true,
          config:{
            placeholder: "Enter header",
            levels: [2, 3, 4],
            defaultLevel: 3
          },
        },
        list:{
          class: EditorjsList,
          inlineToolbar: true,
        },
        image: {
           class: ImageTool,
           config:{
            uploader: {
              uploadByFile: async(image) => {
                  return {
                    success: 1,
                    file: {
                      url: URL.createObjectURL(image),
                      image
                    }
                  }
                }
              },
            },
        },
        embed: {
          class: Embed,
          config: {
            services: {
              youtube: true,
              coub: true,
            }
          }
        },
        Marker:{
          class: Marker,
        },

        code: CodeTool,
      },
      onChange: async () => {
        const data = await editorjsRef.current.save();
        // set content in blog data
        setBlogData((blogData) => ({
          ...blogData,
          content: data
        })),
        // editorjsRef.current = data;
        console.log(data);
      }
    });
  }



  useEffect(() => {
    
    if (editorjsRef.current === null) {
      initializeEditorjs();
    }
  }, []);

  

  
  

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-5xl sm:text-5xl font-light text-gray-800 mb-6 text-center leading-tight tracking-tight">
        {id ? "Refine Your Words" : "Craft Your Story"}
      </h1>

      <form
        className="space-y-10"
        onSubmit={id ? handleEditBlog : handlePostBlog}
      >
        {/* Title */}
        <div>
          <input
            id="title"
            type="text"
            name="title"
            value={blogData.title}
            onChange={handleBlogData}
            className="w-full text-4xl my-3 py-1 font-semibold bg-transparent focus:outline-none placeholder-gray-400 placeholder:text-4xl"
            placeholder="Blog Title"
          />
        </div>

        {/* Description */}
        <div>
          <textarea
            id="description"
            name="description"
            value={blogData.description}
            onChange={handleBlogData}
            className="w-full text-lg bg-transparent focus:outline-none placeholder-gray-400"
            rows="3"
            placeholder="Write a short description..."
          />
        </div>

        {/* Cover Image Upload */}
        <div>
          <div className="relative bg-gray-100 border border-gray-300 rounded-md overflow-hidden">
            <label
              htmlFor="image"
              className="text-lg font-medium text-gray-700 cursor-pointer block"
            >
              {blogData.image ? (
                <img
                  alt="Cover Preview"
                  className="max-w-full h-auto mx-auto"
                  src={
                    typeof blogData.image === "string"
                      ? blogData.image
                      : URL.createObjectURL(blogData.image)
                  }
                />
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-500 border border-dashed rounded-md">
                  Click to upload cover image
                </div>
              )}
            </label>

            <input
              id="image"
              accept=".png, .jpg, .jpeg"
              type="file"
              name="image"
              placeholder="Select Image"
              onChange={handleBlogData}
              className="hidden"
            />
          </div>
        </div>

        {/* EditorJS Content */}
        <div>
          <div
            id="editorjs"
            className="bg-white border border-gray-200 rounded-md px-4 py-6 min-h-[300px]"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-black hover:bg-gray-900 text-white text-lg font-medium py-3 rounded-md transition duration-300"
          >
            {id ? "Update Blog" : "Publish Blog"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBlog;
