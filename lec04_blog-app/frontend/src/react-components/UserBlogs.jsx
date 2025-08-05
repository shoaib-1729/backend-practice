import { useUser } from "../context/UserContext";
import { Link } from "react-router-dom";
import { formatDate } from "../utils/formatDate";
import { handleSaveBlog } from "../utils/helperFunc";
import { useSelector } from "react-redux";

const UserBlogs = () => {
     const userData = useUser();
      const { token } = useSelector((state) => state.user);
    
  return (
    <div>
           {userData?.blogs.map((blog) => (
            <Link
              key={blog._id}
              to={`/blog/${blog.blogId}`}
              className="group flex flex-col sm:flex-row gap-6 py-6 border-b border-gray-200 hover:bg-gray-50 transition px-2 rounded-lg"
            >
              <div className="flex-1">
<<<<<<< HEAD
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 ">
=======
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 group-hover:underline">
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
                  {blog.title}
                </h2>
                <p className="text-gray-600 mt-2 text-sm sm:text-base line-clamp-2">
                  {blog.description}
                </p>
                <div className="flex items-center text-xs text-gray-500 mt-4 gap-6">
                  <span>{formatDate(blog.createdAt)}</span>
                  <span className="flex items-center gap-1">
                    <i className="fi fi-rr-social-network text-sm"></i> {blog.likes.length}
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="fi fi-sr-comment-alt text-sm"></i> {blog.comments?.length || 0}
                  </span>
                  <span className="cursor-pointer hover:text-black">
                    <i
                      onClick={() => handleSaveBlog(blog._id, token)}
                      className="fi fi-rr-bookmark text-sm"
                    ></i>
                  </span>
                </div>
              </div>
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full sm:w-40 h-32 object-cover rounded-md shadow-sm border"
              />
            </Link>
          ))}
      
    </div>
  )
};

export default UserBlogs;
