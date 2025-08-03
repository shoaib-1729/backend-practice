import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import DisplayBlog from "./DisplayBlog";
import { usePagination } from "../hooks/usePagination";
import DisplayLoadMore from "./DisplayLoadMore";

const SearchedBlog = () => {
  const [searchParams] = useSearchParams();
  const [pageNo, setPageNo] = useState(1);

  const q = searchParams.get("q");

  const { data, blogCount, hasMoreBlogs } = usePagination(
    "search-query",
    undefined,
    { q },
    undefined,
    pageNo,
    1
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex flex-col divide-y divide-gray-200">

        {/* Show when blogs are found */}
   {data.length !== 0 && (
  <div className="my-10">
    <h1 className="text-4xl font-semibold font-serif leading-tight tracking-tight text-gray-900">
      <span className="text-gray-500">Search results for </span>
      <span className="italic text-black">"{q}"</span>
      <span className="text-gray-400"> / </span>
      <span className="text-gray-600 text-lg font-normal">
       ({blogCount} blog{blogCount !== 1 && "s"})
      </span>
    </h1>
    <hr className="mt-4 border-gray-300" />
  </div>
)}


        {/* No blog found UI */}
        {!data.length && (
          <div className="max-w-2xl mx-auto my-10 px-4">
            <h1 className="text-3xl font-bold font-sans text-gray-700 mb-4">
              <span className="text-gray-400">No results found for </span>
              <span className="text-black italic">"{q}"</span>
            </h1>
            <p className="text-base text-gray-600 leading-relaxed">
              Make sure all words are spelled correctly. <br />
              Try different keywords. <br />
              Try more general keywords. <br />
              Try using fewer words or simplifying your search.
            </p>
          </div>
        )}

        {/* Display matching blogs */}
        <DisplayBlog data={data} />

        {/* Load more button */}
        <div className="flex justify-center mt-4">
          <DisplayLoadMore
            data={data}
            hasMoreBlogs={hasMoreBlogs}
            setPageNo={setPageNo}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchedBlog;
