import { Link } from "react-router-dom";
import { formatDate } from "../utils/formatDate";
import { handleSaveBlog } from "../utils/helperFunc";
import { useSelector } from "react-redux";

const DisplayBlog = ({ data }) => {
  const { token } = useSelector((state) => state.user);

  return (
    <div className="space-y-12">
      {data.map((blog) => (
        <article
          key={blog?.blogId}
          className="border-b last:border-b-0 hover:bg-gray-50 transition px-2 rounded-lg"
        >
          {/* Author Row (moved outside Link) */}
          <div className="flex items-center space-x-2 mb-3">
            <Link
              to={`/@${blog.creator.username}`}
              className="flex items-center gap-2 text-sm text-gray-700 hover:underline font-medium"
            >
              <img
                src={
                  blog.creator?.profilePic
                    ? blog.creator.profilePic
                    : `https://api.dicebear.com/9.x/initials/svg?seed=${blog?.creator?.name}`
                }
                alt="avatar"
                className="w-5 h-5 rounded-full object-cover"
              />
              {blog.creator.name}
            </Link>
            <span className="text-gray-300">✨</span>
            <span className="text-sm text-gray-500">
              {formatDate(blog.createdAt)}
            </span>
          </div>

          {/* Entire Blog Card is a Link */}
          <Link to={`/blog/${blog.blogId}`} className="block">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Content */}
              <div className="flex-1 space-y-3">
                {/* Title */}
                <h2 className="text-2xl font-extrabold text-gray-900 leading-snug">
                  {blog.title}
                </h2>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed line-clamp-2">
                  {blog.description}
                </p>

                {/* Meta actions */}
                <div className="flex items-center justify-between pt-2">
                  {/* Stats & Tags */}
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <i className="fi fi-rr-social-network"></i>
                      <span>{blog?.likes?.length}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <i className="fi fi-sr-comment-alt"></i>
                      <span>{blog?.comments?.length || 0}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {blog?.tag?.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {blog?.tag?.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{blog.tag.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault(); // prevent navigation
                      handleSaveBlog(blog._id, token);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <i className="fi fi-rr-bookmark"></i>
                  </button>
                </div>
              </div>

              {/* Thumbnail Image */}
              <div className="lg:w-32 lg:h-32 flex-shrink-0">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-32 lg:h-full object-cover"
                />
              </div>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
};

export default DisplayBlog;
