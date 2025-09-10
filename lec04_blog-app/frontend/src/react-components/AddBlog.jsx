import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/shadcn-components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import EditorjsList from "@editorjs/list";
import CodeTool from "@editorjs/code";
import Marker from "@editorjs/marker";
import Embed from "@editorjs/embed";
import ImageTool from "@editorjs/image";
import { updateUser } from "../utils/userSlice";

const AddBlog = () => {
  const [blogData, setBlogData] = useState({
    title: "",
    description: "",
    image: null,
    content: "",
    draft: false,
    tag: [],
  });
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const { id } = useParams();
  const editorjsRef = useRef(null);
  const { token } = useSelector((slice) => slice.user);
  const { title, description, image, content, draft, tag } = useSelector(
    (slice) => slice.selectedBlog
  );

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const controllerRef = useRef(null);

  const handleBlogData = (e) => {
    if (blogData.title) {
      // enable button
      setIsButtonDisabled(false);
    }

    const { name, value, files } = e.target;
    if (name === "image") {
      setBlogData((prevData) => ({
        ...prevData,
        [name]: files[0],
      }));
    } else if (name === "tag") {
      setBlogData((prev) => ({ ...prev, tag: [...prev.tag, value] }));
    } else if (name === "draft") {
      setBlogData((prevData) => ({
        ...prevData,
        [name]: value === "true",
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
        draft,
        tag: tag || [],
      });
    } else {
      setBlogData({
        title: "",
        description: "",
        image: null,
        content: "",
        draft: false,
        tag: [],
      });
    }
  }, [id, title, description, image, content, draft, tag]);

  // Cleanup function for abort controller
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (editorjsRef.current === null) {
      initializeEditorjs();
    }
  }, []);

  function handleTagKeyDown(e) {
    if (e.code === "Space") {
      e.preventDefault();
      return;
    }

    if (e.code === "Enter") {
      e.preventDefault();
      // enable button
      setIsButtonDisabled(false);

      const newTag = e.target.value;

      if (blogData.tag.length == 10) {
        return toast.error("You've reached the maximum of 10 tags.");
      }
      if (blogData.tag.includes(newTag)) {
        return toast.error("This tag is already added. Try a different one.");
      }
      setBlogData((prev) => {
        const updatedTag = [...prev.tag, newTag];
        // True value
        return {
          ...prev,
          tag: updatedTag,
        };
      });
      e.target.value = "";
    }
  }

  // handle edit blog
  async function handleEditBlog(e) {
    // enable button
    setIsButtonDisabled(true);

    e.preventDefault();

    let formData = new FormData();

    for (let data of Object.entries(blogData)) {
      const [key, value] = data;
      if (key == "image") {
        formData.append(key, value);
      }

      formData.append(key, JSON.stringify(value));
    }

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

    try {
      controllerRef.current = new AbortController();

      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          signal: controllerRef.current.signal,
        }
      );

      //  redirect to home page
      if (res.status == 200) {
        toast.success(res.data.message);
        // navigate -> home page
        navigate("/", { replace: true });
        // update user
        dispatch(updateUser(res.data.user));
      }
    } catch (err) {
      if (err.name === "CanceledError") {
        toast.error("Update request cancelled");
      } else {
        toast.error(err.response?.data?.message || "Error updating user");
      }
    }
  }

  function handleTagRemove(index) {
    // enable update button
    setIsButtonDisabled(false);

    const updatedTag = blogData.tag.filter((_, tagIndex) => index !== tagIndex);

    // set tag to blog data
    setBlogData((prev) => ({ ...prev, tag: updatedTag }));
  }

  const handleCancel = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null; // cleanup
    }
    navigate(-1);
  };

  // form submit pr db call karwao -> create blog
  async function handlePostBlog(e) {
    e.preventDefault();
    // disable button
    setIsButtonDisabled(true);

    let formData = new FormData();
    for (let data of Object.entries(blogData)) {
      const [key, value] = data;
      if (key == "image") {
        formData.append(key, value);
      }

      formData.append(key, JSON.stringify(value));
    }

    blogData.content.blocks.forEach((block) => {
      if (block.type === "image") {
        formData.append("images", block.data.file.image);
      }
    });

    try {
      controllerRef.current = new AbortController();

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/blogs`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          signal: controllerRef.current.signal,
        }
      );

      // redirect to home page
      if (res.status == 200) {
        toast.success(res.data.message);
        // navigate -> home page
        navigate("/");
      }
    } catch (err) {
      if (err.name === "CanceledError") {
        toast.error("Update request cancelled");
      } else {
        toast.error(err.response?.data?.message || "Error updating user");
      }
    }
  }

  const initializeEditorjs = () => {
    editorjsRef.current = new EditorJS({
      holder: editorjsRef.current,
      placeholder: "Write your blog content here...",
      data: id ? content : undefined,
      tools: {
        header: {
          class: Header,
          inlineToolbar: true,
          config: {
            placeholder: "Enter header",
            levels: [2, 3, 4],
            defaultLevel: 3,
          },
        },
        list: {
          class: EditorjsList,
          inlineToolbar: true,
        },
        image: {
          class: ImageTool,
          config: {
            captionPlaceholder: "Caption",
            uploader: {
              uploadByFile: async (image) => {
                return {
                  success: 1,
                  file: {
                    url: URL.createObjectURL(image),
                    image,
                  },
                };
              },
            },
          },
        },
        embed: {
          class: Embed,
          config: {
            services: {
              youtube: true,
              coub: true,
            },
          },
        },
        Marker: {
          class: Marker,
        },

        code: CodeTool,
      },
      onChange: async () => {
        const data = await editorjsRef.current.save();
        // set content in blog data
        (setBlogData((blogData) => ({
          ...blogData,
          content: data,
        })),
          setIsButtonDisabled(false));
      },
    });
  };

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
            className="w-full text-4xl my-3 py-1 bg-transparent focus:outline-none placeholder-gray-400 placeholder:text-4xl font-light"
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
              className="text-lg font-light text-gray-700 cursor-pointer block"
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
                <div className="flex font-light items-center justify-center h-48 text-gray-500 border border-dashed rounded-md">
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
        {/* Tag */}
        <div className="space-y-1">
          {/* Tag Input */}
          <input
            type="text"
            name="tag"
            className="w-full border border-gray-300 focus:outline-none focus:ring-black/60 rounded-lg px-4 py-3 text-sm sm:text-base placeholder-gray-400"
            onKeyDown={handleTagKeyDown}
            placeholder="Add a tag and press Enter"
          />

          {/* Tag Display */}
          <div className="flex flex-wrap gap-2">
            {blogData?.tag?.map((tag, index) => (
              <div key={index}>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-800 text-xs font-light rounded-md hover:bg-black hover:opacity-70 hover:text-white">
                  <span className="leading-none">{tag}</span>
                  <i
                    onClick={() => handleTagRemove(index)}
                    className="fi fi-sr-cross-circle text-sm cursor-pointer leading-none flex items-center"
                  ></i>
                </div>
              </div>
            ))}
          </div>

          {/* Just below tags — small and stuck to them */}
          <p className="text-gray-400 text-[10px] leading-none m-0 p-0">
            **you can add up to {10 - blogData.tag.length} more tag(s)
          </p>
        </div>
        {/* Draft Selector */}
        <div className="pt-2">
          <label className="block text-sm font-light text-gray-700 mb-1">
            Save as draft?
          </label>
          <select
            name="draft"
            value={blogData.draft}
            onChange={handleBlogData}
            className="w-full border border-gray-300 rounded-md px-4 py-2 bg-white text-gray-800 focus:outline-none focus:ring-black/60 text-sm"
          >
            <option value={false}>No (Publish)</option>
            <option value={true}>Yes (Save as Draft)</option>
          </select>
        </div>
        {/* EditorJS Content */}
        <div>
          <div
            id="editorjs"
            className="bg-white border border-gray-200 rounded-md px-4 py-6 min-h-[300px]"
          />
        </div>
        {/* Submit Button */}
        <div className="pt-4 flex flex-col sm:flex-row sm:justify-end items-center gap-2">
          {/* Cancel Button */}
          <Button
            onClick={handleCancel}
            variant="outline"
            className="w-full sm:w-40 border-red-600 text-red-600 hover:bg-red-50 cursor-pointer"
          >
            Cancel
          </Button>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isButtonDisabled}
            className={`
      w-full sm:w-40 cursor-pointer
      ${isButtonDisabled ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-black text-white hover:bg-gray-900"}
    `}
          >
            {blogData.draft
              ? "Save as Draft"
              : id
                ? "Update Blog"
                : "Publish Blog"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddBlog;
