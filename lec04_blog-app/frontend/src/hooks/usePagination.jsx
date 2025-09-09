import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

export const usePagination = (
  path,
  tagName,
  queryParams = {},
  removeSelectedBlog = null,
  pageNo,
  limit
) => {
  const [data, setData] = useState([]);
  const [blogCount, setBlogCount] = useState(0);
  const [hasMoreBlogs, setHasMoreBlogs] = useState(true);
  const dispatch = useDispatch();

  const prevQueryRef = useRef(JSON.stringify(queryParams));

  //   Clear blog if query changes
  useEffect(() => {
    const currentQueryRef = JSON.stringify(queryParams);
    if (prevQueryRef.current !== currentQueryRef) {
      // pichla blog data khali kardo
      setData([]);
      // nayi value set karo
      prevQueryRef.current = currentQueryRef;
    }
  }, [JSON.stringify(queryParams)]);

  //   Only removeSelectedBlog on mount
  useEffect(() => {
    if (removeSelectedBlog) {
      dispatch(removeSelectedBlog());
    }
  }, []);

  // Main blog fetch
  useEffect(() => {
    async function fetchBlog() {
      try {
        const res = await axios.get(
          path === "tag"
            ? `${import.meta.env.VITE_BASE_URL}/tag/${tagName}`
            : `${import.meta.env.VITE_BASE_URL}/${path}`,
          {
            params: { ...queryParams, pageNo, limit },
          }
        );
        setData((prev) => [...prev, ...res.data.blogs]);
        setHasMoreBlogs(res.data.hasMoreBlogs);
        setBlogCount(res.data.blogCount);
      } catch (err) {
        toast.error("Error fetching blog:", err);
        setData([]);
      }
    }

    fetchBlog();
  }, [JSON.stringify(queryParams), pageNo]);

  return { data, blogCount, hasMoreBlogs };
};
