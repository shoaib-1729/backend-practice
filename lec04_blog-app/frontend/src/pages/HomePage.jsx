import { useState } from "react";
import { removeSelectedBlog } from "../utils/selectedBlogSlice";
import DisplayBlog from "../react-components/DisplayBlog";
import { usePagination } from "../hooks/usePagination";
import DisplayLoadMore from "../react-components/DisplayLoadMore";
import { Link } from "react-router-dom";
<<<<<<< HEAD
import { useSelector } from "react-redux";
import { formatDate } from "../utils/formatDate";

const HomePage = () => {
  const [pageNo, setPageNo] = useState(1);
  const { savedBlogs, likedBlogs } = useSelector((state) => state.user);
  console.log(savedBlogs);

=======

const HomePage = () => {
  const [pageNo, setPageNo] = useState(1);
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
  const { data, hasMoreBlogs } = usePagination(
    "blogs",
    undefined,
    {},
    removeSelectedBlog,
    pageNo,
    4
  );

<<<<<<< HEAD
// saare tag nikaalo savedBlogs mei se, duplicate hata do
  const recommendedTags = Array.from(
    new Set(savedBlogs.flatMap((blog) => blog?.tag))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="relative flex flex-col-reverse md:flex-row gap-8">
        {/* Full-height vertical separator */}
        <div className="hidden md:block absolute top-0 bottom-0 left-2/3 w-px bg-gray-200" />

        {/* Main Blog Section */}
        <div className="w-full md:w-2/3 ">
          <div className="flex flex-col divide-y divide-gray-200 ">
=======
  const recommendedTags = [
    "Technology",
    "Daaru",
    "MentalHealth",
    "JavaScript",
    "Design",
    "React",
    "AI",
    "Career",
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col-reverse md:flex-row gap-8">
        {/* Main Blog Section */}
        <div className="flex-1">
          <div className="flex flex-col divide-y divide-gray-200">
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
            <DisplayBlog data={data} />
            <div className="flex justify-center mt-4">
              <DisplayLoadMore
                data={data}
                hasMoreBlogs={hasMoreBlogs}
                setPageNo={setPageNo}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
<<<<<<< HEAD
        <aside className="w-full md:w-1/3 md:pl-8">
          <div className="mb-10">
=======
        <aside className="w-full md:w-64">
          <div className="border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-4 md:sticky md:top-20">
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Recommended Tags
            </h2>
            <div className="flex flex-wrap gap-2">
<<<<<<< HEAD
              {recommendedTags?.map((tag, index) => (
=======
              {recommendedTags.map((tag, index) => (
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
                <Link
                  key={index}
                  to={`/tag/${tag.trim().toLowerCase()}`}
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200 transition"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
<<<<<<< HEAD

          {/* Saved Blogs */}
          <div>
            <h2 className="text-md font-semibold text-gray-800 mb-4">
              Your Saved Blogs
            </h2>

            {savedBlogs?.length === 0 ? (
              <p className="text-gray-500 text-sm">No saved blogs yet.</p>
            ) : (
              <div className="space-y-4">
                {savedBlogs.slice(0, 3).map((blog) => (
                  <div
                    key={blog._id}
                    className="flex items-start gap-3 hover:bg-gray-50 p-2 rounded-md transition"
                  >
                    {/* Thumbnail */}
                    {blog.image && (
                      <Link to={`/blog/${blog.blogId}`}>
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="w-16 h-16 rounded-md object-cover"
                        />
                      </Link>
                    )}

                    {/* Blog Info */}
                    <div className="flex flex-col justify-between flex-1">
                      {/* Creator info */}
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

                      {/* Blog title and meta */}
                      <Link to={`/blog/${blog.blogId}`} className="mt-1">
                        <h3
            className="text-sm font-extrabold text-gray-900 leading-snug"
                        
                        >
                          {blog.title}
                        </h3>

                        <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                          <span className="text-yellow-500">★</span>
                          <span>{formatDate(blog.createdAt)}</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                ))}

{/* view all */}
                {/* <Link
                  to="/saved"
                  className="text-sm text-blue-600 hover:underline mt-2 block text-right"
                >
                  View All
                </Link> */}
              </div>
            )}
          </div>

          {/* Liked Blogs */}
          <div className="mt-10">
            <h2 className="text-md font-semibold text-gray-800 mb-4">
              Your Liked Blogs
            </h2>

            {likedBlogs?.length === 0 ? (
              <p className="text-gray-500 text-sm">No liked blogs yet.</p>
            ) : (
              <div className="space-y-4">
                {likedBlogs.slice(0, 3).map((blog) => (
                  <div
                    key={blog._id}
                    className="flex items-start gap-3 hover:bg-gray-50 p-2 rounded-md transition"
                  >
                    {/* Thumbnail */}
                    {blog.image && (
                      <Link to={`/blog/${blog.blogId}`}>
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="w-16 h-16 rounded-md object-cover"
                        />
                      </Link>
                    )}

                    {/* Blog Info */}
                    <div className="flex flex-col justify-between flex-1">
                      {/* Creator info */}
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

                      {/* Blog title and meta */}
                      <Link to={`/blog/${blog.blogId}`} className="mt-1">
                        <h3 
            className="text-sm font-extrabold text-gray-900 leading-snug"

                        
                        >
                          {blog.title}
                        </h3>

                        <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                          <span className="text-yellow-500">★</span>
                          <span>{formatDate(blog.createdAt)}</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                ))}

{/* view all  */}
                {/* <Link
                  to="/saved"
                  className="text-sm text-blue-600 hover:underline mt-2 block text-right"
                >
                  View All
                </Link> */}
              </div>
            )}
          </div>
=======
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
        </aside>
      </div>
    </div>
  );
};

export default HomePage;
