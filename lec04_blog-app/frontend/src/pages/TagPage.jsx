import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import DisplayBlog from "../react-components/DisplayBlog";
import { usePagination } from "../hooks/usePagination";
import DisplayLoadMore from "../react-components/DisplayLoadMore";

const TagPage = () => {
  const { tagName } = useParams();
  const [searchParams] = useSearchParams();
  const exclude = searchParams.get("exclude");
  const [pageNo, setPageNo] = useState(1);

  const { data, blogCount, hasMoreBlogs } = usePagination(
    "tag",
    tagName,
    { exclude },
    undefined,
    pageNo,
    1
  );

  const cleanedTag = tagName.replace(/^#/, "");

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-8 py-10">
      {/* Header Section */}
      {data.length !== 0 && (
        <div className="border-b pb-6 mb-6">
          <p className="text-sm uppercase text-gray-400 tracking-wide font-semibold mb-2">
            Tagged under
          </p>
          <h1 className="text-4xl font-extrabold text-black mb-2">
            #{cleanedTag}
          </h1>
          <p className="text-sm text-gray-500">
            {blogCount} blog{data.length === 1 ? "" : "s"} found with this tag
          </p>
        </div>
      )}

      {/* No Results Found */}
      {!data.length && (
        <div className="text-center py-16">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            No results found for{" "}
            <span className="italic text-black">#{cleanedTag}</span>
          </h1>
          <p className="text-gray-600 text-base leading-relaxed">
            • Make sure all words are spelled correctly. <br />
            • Try different keywords or more general terms. <br />• Try using
            fewer words.
          </p>
        </div>
      )}

      {/* Blog List */}
      <DisplayBlog data={data} />

      {/* Load More Button */}
      <div className="flex justify-center mt-8">
        <DisplayLoadMore
          data={data}
          hasMoreBlogs={hasMoreBlogs}
          setPageNo={setPageNo}
        />
      </div>
    </div>
  );
};

export default TagPage;
