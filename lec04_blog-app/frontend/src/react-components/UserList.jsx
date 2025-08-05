import { Link } from "react-router-dom";
import { formatDate } from "../utils/formatDate";
import { handleSaveBlog } from "../utils/helperFunc";
import { useSelector } from "react-redux";
import { useState } from "react";

const UserList = () => {
  const { token, savedBlogs, likedBlogs } = useSelector((state) => state.user);

  // Combine and remove duplicates using Set
  const seen = new Set();
  const totalBlogs = [...savedBlogs, ...likedBlogs].filter((blog) => {
    if (seen.has(blog?._id)) return false;
    seen.add(blog?._id);
    return true;
  });

  // Pagination setup
  const blogsPerPage = 3;
  const [currentPage, setCurrentPage] = useState(1);

  const startIdx = (currentPage - 1) * blogsPerPage;
  const endIdx = startIdx + blogsPerPage;
  const paginatedBlogs = totalBlogs.slice(startIdx, endIdx);
  const totalPages = Math.ceil(totalBlogs.length / blogsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="space-y-6">
      {paginatedBlogs?.map((blog) => (
        <Link
          key={blog?._id}
          to={`/blog/${blog?.blogId}`}
          className="group flex flex-col sm:flex-row gap-6 py-6 border-b border-gray-200 hover:bg-gray-50 transition px-2 rounded-lg"
        >
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
              {blog?.title}
            </h2>
            <p className="text-gray-600 mt-2 text-sm sm:text-base line-clamp-2">
              {blog?.description}
            </p>
            <div className="flex items-center text-xs text-gray-500 mt-4 gap-6">
              <span>{formatDate(blog?.createdAt)}</span>
              <span className="flex items-center gap-1">
                <i className="fi fi-rr-social-network text-sm"></i>
                {blog?.likes?.length}
              </span>
              <span className="flex items-center gap-1">
                <i className="fi fi-sr-comment-alt text-sm"></i>
                {blog?.comments?.length || 0}
              </span>
              <span className="cursor-pointer hover:text-black">
                <i
                  onClick={() => handleSaveBlog(blog?._id, token)}
                  className="fi fi-rr-bookmark text-sm"
                ></i>
              </span>
            </div>
          </div>
          <img
            src={blog?.image}
            alt={blog?.title}
            className="w-full sm:w-40 h-32 object-cover rounded-md shadow-sm border"
          />
        </Link>
      ))}

      {/* Pagination Controls */}
      {totalBlogs.length > blogsPerPage && (
        <div className="flex justify-center items-center gap-4 mt-4">
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
    </div>
  );
};

export default UserList;
