import { useState, useEffect, useRef} from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import EditorjsList from '@editorjs/list';
import CodeTool from '@editorjs/code';
import Marker from '@editorjs/marker';
import Embed from '@editorjs/embed';
import ImageTool from '@editorjs/image';


const AddBlog = () => {
  const [blogData, setBlogData] = useState({
      title:"",
      description:"",
      image:null,
      content: ""
      })

  const {id} = useParams()

  // useRef
  const editorjsRef = useRef(null);

    // user data from store
    const {token} = useSelector((slice) => slice.user);

    // blog slice data from store
    const {title, description, image, content} = useSelector((slice) => slice.selectedBlog);

    // navigate
    const navigate = useNavigate();

    // form data
    const formData = new FormData();



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

      setBlogData({
        title: title,
        description: description,
        image: image,
        content: content
      });

  };

  // handle edit blog
//   async function handleEditBlog(e){
//     e.preventDefault(); 
    
//     let formData = new FormData();
//     formData.append("title", blogData.title);
//     formData.append("description", blogData.description);
//     formData.append("image", blogData.image);
//     formData.append("content", JSON.stringify(blogData.content));

//     // console.log(blogData);
//     // console.log(JSON.parse(blogData.content));
//     // for(let data of formData.entries()){
//     //   console.log(data);
//     // }

//     // case-1 (if se handle hoga)
//     // content edit, new image add

//     // case-2 (else se handle hoga)
//     // existing image (shown from DB) delete
//     let existingImages = [];

 
//     blogData.content.blocks.forEach((block) => {
//       if (block.type === "image") {
//         if (block.data.file.image) {
//           formData.append("images", block.data.file.image);
//         } else {
//           existingImages.push({
//             url: block.data.file.url,
//             imageId: block.data.file.imageId,
//           });
//         }
//       }
//     });

//     formData.append("existingImages", JSON.stringify(existingImages));

//     console.log(existingImages);

//     try{
//       // console.log(typeof(blogData.image))
//       // console.log(blogData.image)
//       const res = await axios.put(`http://localhost:3000/api/v1/blogs/${id}`, formData,
//         {
//           headers:{
//               "Content-Type":"multipart/form-data",
//               Authorization: `Bearer ${token}`
//           }
//       }
//   )
//   console.log(blogData);

//   //  redirect to home page
//    if(res.status == 200){
//     toast.success(res.data.message)
//     // navigate -> home page
//     navigate("/", { replace: true });
//    }
// }
// catch(err){
//       toast.error(err.response.data.message)
//       console.log("Error posting blog", err)
//   }

//   }

async function handleEditBlog(e) {
  e.preventDefault();
  let formData = new FormData();

  formData.append("title", blogData.title);
  formData.append("description", blogData.description);
  formData.append("image", blogData.image);

  formData.append("content", JSON.stringify(blogData.content));

  // formData.append("tags", JSON.stringify(blogData.tags));
  // formData.append("draft", blogData.draft);
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

  try {
    const res = await axios.put(
      `http://localhost:3000/api/v1/blogs/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success(res.data.message);
    navigate("/");
  } catch (error) {
    console.log(error);
    toast.error(error.response.data.message);
  }
}

    // form submit pr db call karwao -> create blog
    async function handlePostBlog(e){
      e.preventDefault();
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

    // editor js
    // config
    function initializeEditorjs() {
      editorjsRef.current  = new EditorJS({
        holder: 'editorjs',
        placeholder: "write something...",
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

// editor js
    useEffect(()=>{
      if(editorjsRef.current == null){
        initializeEditorjs();
      }
    }, [])

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
          {/* editor js */}
          <div id="editorjs">

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
  