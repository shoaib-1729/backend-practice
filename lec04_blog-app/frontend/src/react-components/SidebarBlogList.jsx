import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";
import { formatDate } from "../utils/formatDate";
import { handleSaveBlog } from "../utils/helperFunc";

const SidebarBlogList = ({ type }) => {
  const { token, savedBlogs, likedBlogs } = useSelector((state) => state.user);

  // Correct blogs list
  const blogs = type === "liked" ? likedBlogs : savedBlogs;

  // Pagination setup
  const blogsPerPage = 3;
  const [currentPage, setCurrentPage] = useState(1);

  const startIdx = (currentPage - 1) * blogsPerPage;
  const endIdx = startIdx + blogsPerPage;
  const paginatedBlogs = blogs.slice(startIdx, endIdx);
  const totalPages = Math.ceil(blogs.length / blogsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Title */}
      <h1 className="text-4xl font-extrabold mb-10 text-gray-900">
        {type === "liked" ? "Your Liked Blogs" : "Your Saved Blogs"}
      </h1>

      {blogs.length > 0 ? (
        <>
          {/* Blog list */}
          <div className="space-y-10">
            {paginatedBlogs.map((blog) => (
              <Link to={`/blog/${blog?.blogId}`}>
                <div
                  key={blog?._id}
                  className="flex flex-col sm:flex-row gap-6 border-b pb-6 hover:bg-gray-50 transition rounded-lg p-3"
                >
                  {/* Text Content */}
                  <div className="flex-1">
                    {/* Author & Date */}
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={
                          blog.creator?.profilePic
                            ? blog.creator.profilePic
                            : `https://api.dicebear.com/9.x/initials/svg?seed=${blog?.creator?.name}`
                        }
                        alt={blog.creator?.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <Link
                        to={`/@${blog.creator?.username}`}
                        className="text-sm font-medium text-gray-700 hover:underline"
                      >
                        {blog.creator?.name}
                      </Link>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-500">
                        {formatDate(blog?.createdAt)}
                      </span>
                    </div>

                    {/* Title */}
                    {/* <Link to={`/blog/${blog?.blogId}`}> */}
                    <h2 className="text-xl font-bold text-gray-900 leading-snug">
                      {blog?.title}
                    </h2>
                    {/* </Link> */}

                    {/* Description */}
                    <p className="text-gray-600 mt-2 text-sm line-clamp-2">
                      {blog?.description}
                    </p>

                    {/* Tags & Actions */}
                    <div className="flex items-center flex-wrap gap-3 mt-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <i className="fi fi-rr-social-network text-sm"></i>
                        {blog?.likes?.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="fi fi-sr-comment-alt text-sm"></i>
                        {blog?.comments?.length || 0}
                      </span>
                      {blog?.tag?.slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-gray-100 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {blog?.tag?.length > 2 && (
                        <span className="text-xs text-gray-400">
                          +{blog.tag.length - 2} more
                        </span>
                      )}
                      <span
                        className="cursor-pointer hover:text-black ml-auto"
                        onClick={() => handleSaveBlog(blog?._id, token)}
                      >
                        <i className="fi fi-rr-bookmark text-sm"></i>
                      </span>
                    </div>
                  </div>

                  {/* Image */}
                  {blog?.image && (
                    <Link to={`/blog/${blog?.blogId}`}>
                      <img
                        src={blog?.image}
                        alt={blog?.title}
                        className="w-full sm:w-40 h-32 object-cover rounded-md shadow-sm"
                      />
                    </Link>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {blogs.length > blogsPerPage && (
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="px-4 py-1 bg-gray-200 rounded cursor-pointer disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-4 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-500 text-center">
          {type === "liked" ? "No liked blogs yet." : "No saved blogs yet."}
        </p>
      )}
    </div>
  );
};

export default SidebarBlogList;
