import { Link } from "react-router-dom";
import { formatDate } from "../utils/formatDate";
import { handleSaveBlog } from "../utils/helperFunc";
import { useSelector } from "react-redux";

const DisplayBlog = ({ data }) => {
  const { token } = useSelector((state) => state.user);



  return (
    <div className="space-y-8">
      {data.map((blog) => (
        <article
          key={blog?.blogId}
          className="border-b last:border-b-0 pb-8 last:pb-0 hover:bg-gray-50 transition-colors rounded-lg p-3 -mx-3"
        >
          {/* Author Row */}
          <div className="flex items-center space-x-2 mb-4">
            <Link
              to={`/@${blog?.creator?.username}`}
              className="flex items-center gap-2 text-sm text-gray-700 hover:underline font-medium"
            >
              <img
                src={
                  blog.creator?.profilePic
                    ? blog.creator.profilePic
                    : `https://api.dicebear.com/9.x/initials/svg?seed=${blog?.creator?.name}`
                }
                alt="avatar"
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="truncate">{blog?.creator?.name}</span>
            </Link>
            <span className="text-gray-300 hidden sm:inline">✨</span>
            <span className="text-sm text-gray-500 hidden sm:inline">
              {formatDate(blog?.createdAt)}
            </span>
          </div>

          {/* Main Blog Content */}
          <Link to={`/blog/${blog?.blogId}`} className="block">
            <div className="flex gap-3 sm:gap-4">
              {/* Content Section */}
              <div className="flex-1 min-w-0">
                {/* Title - Responsive text sizes */}
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight mb-3 line-clamp-2">
                  {blog?.title}
                </h2>

                {/* Description - Only show on larger screens */}
                <p className="text-gray-600 leading-relaxed line-clamp-2 mb-4 hidden sm:block text-sm lg:text-base">
                  {blog?.description}
                </p>

                {/* Mobile: Show only on small screens */}
                <div className="sm:hidden mb-4">
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-1">
                    {blog?.description}
                  </p>
                </div>

                {/* Meta Information */}
                <div className="flex items-center justify-between">
                  {/* Stats & Tags */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 min-w-0 flex-1">
                    <div className="flex items-center space-x-1">
                      <i className="fi fi-rr-social-network text-xs"></i>
                      <span>{blog?.likedBy?.length}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <i className="fi fi-sr-comment-alt text-xs"></i>
                      <span>{blog?.comments?.length || 0}</span>
                    </div>

                    {/* Tags - Show only first tag on mobile */}
                    <div className="hidden sm:flex flex-wrap gap-2">
                      {blog?.tag?.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded whitespace-nowrap"
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

                    {/* Mobile: Show only one tag */}
                    <div className="sm:hidden">
                      {blog?.tag?.length > 0 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          {blog.tag[0]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleSaveBlog(blog._id, token);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
                  >
                    <i className="fi fi-rr-bookmark text-lg"></i>
                  </button>
                </div>

                {/* Mobile: Show date at bottom */}
                <div className="sm:hidden mt-3 text-xs text-gray-400">
                  {formatDate(blog.createdAt)}
                </div>
              </div>

              {/* Image Section - Fixed for very small screens */}
              <div className="w-20 h-20 xs:w-24 xs:h-24 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 flex-shrink-0 ml-auto">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover rounded-lg"
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