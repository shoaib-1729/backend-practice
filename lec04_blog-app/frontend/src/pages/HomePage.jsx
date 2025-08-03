import { useState } from "react";
import { removeSelectedBlog } from "../utils/selectedBlogSlice";
import DisplayBlog from "../react-components/DisplayBlog";
import { usePagination } from "../hooks/usePagination";
import DisplayLoadMore from "../react-components/DisplayLoadMore";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [pageNo, setPageNo] = useState(1);
  const { data, hasMoreBlogs } = usePagination(
    "blogs",
    undefined,
    {},
    removeSelectedBlog,
    pageNo,
    4
  );

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
        <aside className="w-full md:w-64">
          <div className="border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-4 md:sticky md:top-20">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Recommended Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {recommendedTags.map((tag, index) => (
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
        </aside>
      </div>
    </div>
  );
};

export default HomePage;
