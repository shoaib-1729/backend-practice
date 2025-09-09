import axios from "axios";
import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/shadcn-components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shadcn-components/ui/tooltip";
import {
  removeSelectedBlog,
  addSelectedBlog,
  changeLikes,
} from "../utils/selectedBlogSlice";
import { useDispatch, useSelector } from "react-redux";
import { formatDate } from "../utils/formatDate";
import Comment from "../react-components/Comment";
import { setIsOpen } from "../utils/commentSlice";
import { handleSaveBlog, handleFollowCreator } from "../utils/helperFunc";
import DeleteConfirmation from "../react-components/DeleteConfirmation";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// Light theme
import { prism } from "react-syntax-highlighter/dist/esm/styles/prism";
import { updateUser } from "../utils/userSlice";

const BlogPage = () => {
  const [blog, setBlog] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowCreator, setIsFollowCreator] = useState(false);

  const [loadingTimeout, setLoadingTimeout] = useState(false);

  const { id } = useParams();
  const {
    token,
    email,
    id: userId,
    following,
    // profilePic,
  } = useSelector((state) => state.user);
  const { likedBy, comments, content, blogId } = useSelector(
    (state) => state.selectedBlog
  );
  const { isOpen } = useSelector((state) => state.comment);
  const dispatch = useDispatch();

  const controllerRef = useRef();

  // Map heading levels to Tailwind classes
  const headingSizeMap = {
    1: "text-3xl",
    2: "text-2xl",
    3: "text-xl",
    4: "text-lg",
    5: "text-md",
    6: "text-sm",
  };

  const cleanHTML = (html) => {
    if (typeof html !== "string") return "";
    try {
      const parsed = JSON.parse(`"${html}"`);
      return parsed
        .replace(/\n/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\u200B/g, "")
        .trim();
    } catch (err) {
      return html
        .replace(/\\"/g, '"') // unescape quotes
        .replace(/\\/g, "") // remove stray backslashes
        .replace(/\n/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\u200B/g, "")
        .trim();
    }
  };

  const countTotalComments = (comments) => {
    let count = 0;
    const countReplies = (commentList) => {
      for (const comment of commentList) {
        count += 1;
        if (comment.replies?.length) {
          countReplies(comment.replies);
        }
      }
    };
    countReplies(comments);
    return count;
  };

  const renderListItems = (items) => {
    return items.map((item, idx) => (
      <li key={idx}>
        <div dangerouslySetInnerHTML={{ __html: cleanHTML(item.content) }} />
        {item.items?.length > 0 && (
          <ul className="list-disc pl-6 mt-2">{renderListItems(item.items)}</ul>
        )}
      </li>
    ));
  };

  // Enhanced code block renderer with language detection
  const detectLanguage = (code) => {
    if (!code || typeof code !== "string") return "text";

    const codeToCheck = code.toLowerCase().trim();

    // JavaScript/TypeScript patterns
    if (
      codeToCheck.includes("function") ||
      codeToCheck.includes("const ") ||
      codeToCheck.includes("let ") ||
      codeToCheck.includes("var ") ||
      codeToCheck.includes("=>") ||
      codeToCheck.includes("console.log") ||
      (codeToCheck.includes("import ") && codeToCheck.includes("from"))
    ) {
      return "javascript";
    }

    // Python patterns
    if (
      codeToCheck.includes("def ") ||
      (codeToCheck.includes("import ") && !codeToCheck.includes("from")) ||
      codeToCheck.includes("print(") ||
      codeToCheck.includes("if __name__") ||
      /^\s*(class|def)\s+\w+/m.test(codeToCheck)
    ) {
      return "python";
    }

    // HTML patterns
    if (
      codeToCheck.includes("<html") ||
      codeToCheck.includes("<div") ||
      codeToCheck.includes("<head>") ||
      codeToCheck.includes("<!doctype")
    ) {
      return "html";
    }

    // CSS patterns
    if (
      codeToCheck.includes("{") &&
      codeToCheck.includes("}") &&
      (codeToCheck.includes(":") ||
        codeToCheck.includes(".") ||
        codeToCheck.includes("#") ||
        codeToCheck.includes("@media"))
    ) {
      return "css";
    }

    // Java patterns
    if (
      codeToCheck.includes("public class") ||
      codeToCheck.includes("public static void main") ||
      codeToCheck.includes("System.out.println")
    ) {
      return "java";
    }

    // C/C++ patterns
    if (
      codeToCheck.includes("#include") ||
      codeToCheck.includes("int main()") ||
      codeToCheck.includes("printf(")
    ) {
      return "c";
    }

    // JSON pattern
    if (
      codeToCheck.startsWith("{") &&
      codeToCheck.endsWith("}") &&
      codeToCheck.includes(":") &&
      codeToCheck.includes('"')
    ) {
      return "json";
    }

    // SQL patterns
    if (
      codeToCheck.includes("select ") ||
      codeToCheck.includes("insert into") ||
      codeToCheck.includes("create table") ||
      codeToCheck.includes("update ")
    ) {
      return "sql";
    }

    // Default fallback
    return "text";
  };

  const renderCodeBlock = (code, specifiedLanguage = null) => {
    if (!code) return null;

    // Priority: specified language > auto-detected > fallback
    const detectedLanguage = detectLanguage(code);
    const language = specifiedLanguage || detectedLanguage;

    return (
      <div className="mb-6 rounded-xl overflow-hidden border border-gray-200">
        {/* Language indicator */}
        <div className="bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 border-b border-gray-200">
          {language === "text" ? "Code" : language.toUpperCase()}
        </div>

        <SyntaxHighlighter
          language={language}
          style={prism}
          showLineNumbers={true}
          wrapLines={true}
          customStyle={{
            margin: 0,
            padding: "16px 20px",
            backgroundColor: "#f8f9fa",
            fontSize: "14px",
            lineHeight: "1.6",
            fontFamily:
              '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
            color: "#333",
            border: "none",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    );
  };

  async function fetchBlog() {
    // cancel old request if still pending
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    // setLoading(true);
    try {
      const {
        data: { blog },
      } = await axios.get(`${import.meta.env.VITE_BASE_URL}/blogs/${id}`, {
        signal: controller.signal,
      });

      setBlog(blog);
      dispatch(addSelectedBlog(blog));

      // liked check
      setIsLiked(blog.likedBy?.includes(userId) || false);

      // saved check
      setIsSaved(blog.savedBy?.includes(userId) || false);

      // follow check using backend blog data
      let isFollowing =
        blog.creator?.followers?.includes(userId) ||
        blog.creator?.followers?.some(
          (follower) => follower._id === userId || follower === userId
        );

      // cross-check with Redux user.following
      if (following && blog.creator?._id) {
        const reduxFollow = following.some(
          (user) => user._id === blog.creator._id || user === blog.creator._id
        );
        isFollowing = isFollowing || reduxFollow;
      }

      setIsFollowCreator(isFollowing);
    } catch (err) {
      if (axios.isCancel(err)) {
        toast.error("Request cancelled due to navigation/change");
      } else {
        // yaha status code check karo
        // yaha status code check karo
        if (err.response) {
          // blog deleted/not found
          setLoadingTimeout(true);
        }
      }
    }
  }
  // fetch blog whenever id changes
  useEffect(() => {
    fetchBlog();

    return () => {
      // cancel request on unmount / id change
      if (controllerRef.current) {
        controllerRef.current.abort();
      }

      dispatch(setIsOpen(false));

      if (
        window.location.pathname !== `/edit/${id}` &&
        window.location.pathname !== `/blog/${id}`
      ) {
        dispatch(removeSelectedBlog());
      }
    };
  }, [id]);

  async function handleLike() {
    try {
      if (token) {
        const res = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/blogs/like/${blog._id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsLiked((prev) => !prev);
        dispatch(changeLikes(userId));
        // update user
        dispatch(updateUser(res.data.user));
        toast.success(res.data.message);
      }
    } catch (err) {
      setIsLiked((prev) => !prev);
      toast.error("Error liking blog:", err);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 bg-white min-h-screen">
      {!blog ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          {loadingTimeout ? (
            <div className="text-2xl font-light text-gray-500">
              Sorry! Can't fetch blog.
            </div>
          ) : (
            <div className="text-2xl font-light text-gray-400 animate-pulse">
              Loading article...
            </div>
          )}
        </div>
      ) : (
        <div key={blog._id} className="space-y-8">
          {/* Title */}
          <header className="space-y-6">
            <h1
              // className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight"
              className="text-2xl md:text-5xl font-extrabold text-gray-900 leading-snug"
            >
              {blog.title}
            </h1>

            {/* Tags Section */}
            <div className="flex flex-wrap gap-3">
              {blog.tag.map((tag, index) => (
                <Link key={index} to={`/tag/${tag}?exclude=${blogId}`}>
                  <span
                    key={index}
                    className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
                  >
                    {tag}
                  </span>
                </Link>
              ))}
            </div>
          </header>

          {/* Author Section */}
          <div className="flex items-center justify-between py-6 border-y border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14">
                <img
                  src={
                    blog?.creator?.profilePic
                      ? blog?.creator?.profilePic
                      : `https://api.dicebear.com/9.x/initials/svg?seed=${blog?.creator?.name}`
                  }
                  alt="Author"
                  className="w-full h-full rounded-full object-cover border border-gray-200"
                />
              </div>
              <div className="space-y-1">
                <Link to={`/@${blog.creator.username}`}>
                  <h3 className="text-lg font-medium text-gray-900 hover:text-gray-700 transition-colors">
                    {blog?.creator?.name}
                  </h3>
                </Link>
                <div className="flex items-center space-x-3 text-sm text-gray-500">
                  <span>{formatDate(blog.createdAt)}</span>
                  <span>•</span>
                  <span>6 min read</span>
                </div>
              </div>
            </div>

            {/* Follow Button */}
            <button className="px-6 py-2 text-sm font-medium border-2 border-gray-900 text-gray-900 rounded-full hover:bg-gray-900 hover:text-white transition-all duration-200 cursor-pointer">
              {blog.creator?._id === userId ? (
                <Link to="/edit-profile">Edit Profile</Link>
              ) : (
                <span
                  onClick={() =>
                    handleFollowCreator(
                      blog.creator?._id,
                      token,
                      setIsFollowCreator,
                      dispatch
                    )
                  }
                >
                  {isFollowCreator ? "Following" : "Follow"}
                </span>
              )}
            </button>
          </div>

          {/* Blog Cover Image */}
          <div className="my-12">
            <img
              src={blog.image}
              alt="Article cover"
              className="w-full rounded-2xl shadow-sm border border-gray-100"
            />
          </div>

          {/* Description */}
          <div className="my-8">
            <blockquote className="text-2xl font-light text-gray-700 leading-relaxed italic pl-8 border-l-2 border-gray-900">
              {blog.description}
            </blockquote>
          </div>

          {/* Edit Button */}
          {token && blog.creator.email === email && (
            <div className="text-center my-8">
              <Link to={`/edit/${blog.blogId}`}>
                <Button className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-full transition-all duration-200 cursor-pointer">
                  Edit Article
                </Button>
              </Link>
            </div>
          )}

          {/* Interaction Bar */}
          <div className="flex items-center space-x-6 border-t border-gray-300 pt-4">
            {/*        Like */}
            <Tooltip>
              <TooltipTrigger>
                <div
                  className="flex items-center space-x-2 cursor-pointer"
                  onClick={handleLike}
                >
                  <i
                    className={`fi ${
                      isLiked ? "fi-sr-thumbs-up" : "fi-rr-social-network"
                    } text-xl hover:text-blue-500`}
                  ></i>
                  <span className="text-sm text-gray-700 font-medium">
                    {likedBy?.length}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Like</p>
              </TooltipContent>
            </Tooltip>
            {/* Comment */}
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center space-x-2 cursor-pointer">
                  <i
                    onClick={() => dispatch(setIsOpen())}
                    className="fi fi-sr-comment-alt text-xl hover:text-blue-500"
                  ></i>
                  <span className="text-sm text-gray-700 font-medium">
                    {countTotalComments(comments)}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Comment</p>
              </TooltipContent>
            </Tooltip>
            {/* Save */}
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center space-x-2 cursor-pointer">
                  <i
                    onClick={() =>
                      handleSaveBlog(blog._id, token, setIsSaved, dispatch)
                    }
                    className={`fi ${
                      isSaved ? "fi-sr-bookmark" : "fi-rr-bookmark"
                    } text-xl hover:text-blue-500`}
                  ></i>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save</p>
              </TooltipContent>
            </Tooltip>
            {/* Delete */}
            <DeleteConfirmation type="blog" item={blog} />

            <div className="flex items-center space-x-3 text-sm text-gray-500">
              <span>{formatDate(blog.createdAt)}</span>
              <span>•</span>
              <span>6 min read</span>
            </div>
          </div>

          {/* Article Content */}
          <article className="prose prose-xl max-w-none">
            <div className="space-y-8 text-gray-800 leading-relaxed">
              {content.blocks.map((block) => {
                switch (block.type) {
                  case "header": {
                    const Tag = `h${block.data.level}`;
                    return (
                      <Tag
                        key={block.id}
                        className={`mt-12 mb-6 font-semibold ${
                          headingSizeMap[block.data.level]
                        }`}
                      >
                        <span
                          dangerouslySetInnerHTML={{
                            __html: cleanHTML(block.data.text),
                          }}
                        />
                      </Tag>
                    );
                  }
                  case "paragraph":
                    return (
                      <p
                        key={block.id}
                        className="text-lg leading-relaxed mb-6"
                      >
                        <span
                          dangerouslySetInnerHTML={{
                            __html: cleanHTML(block.data.text),
                          }}
                        />
                      </p>
                    );
                  case "list":
                    const ListTag =
                      block.data.style === "ordered" ? "ol" : "ul";
                    return (
                      <ListTag
                        key={block.id}
                        className={`${
                          ListTag === "ol" ? "list-decimal" : "list-disc"
                        } pl-6 space-y-2 mb-6`}
                      >
                        {renderListItems(block.data.items)}
                      </ListTag>
                    );
                  case "code":
                    return (
                      <div key={block.id}>
                        {renderCodeBlock(block.data.code)}
                      </div>
                    );
                  case "image":
                    return (
                      <figure key={block.id} className="my-12 text-center">
                        <img
                          src={block.data.file.url}
                          alt={block.data.caption || "image"}
                          className="rounded-xl shadow-sm border mx-auto"
                        />
                        {block.data.caption && (
                          <figcaption className="text-sm mt-4 italic text-gray-500">
                            {block.data.caption}
                          </figcaption>
                        )}
                      </figure>
                    );
                  default:
                    return null;
                }
              })}
            </div>
          </article>

          {/* Related Topics */}
          <footer className="mt-16 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-6">
              Related Topics
            </h3>
            <div className="flex flex-wrap gap-3">
              {blog.tag.map((tag, index) => (
                <span
                  key={`footer-${index}`}
                  className="px-4 py-2 text-sm font-medium bg-white border-2 border-gray-900 text-gray-900 rounded-full hover:bg-gray-900 hover:text-white transition-all duration-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </footer>

          {/* Comment Overlay */}
          {isOpen && (
            <div
              onClick={() => dispatch(setIsOpen(false))}
              className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 cursor-pointer"
              style={{ width: "calc(100% - 400px)" }}
            />
          )}

          {/* Comment Component */}
          {isOpen && <Comment />}
        </div>
      )}
    </div>
  );
};

export default BlogPage;
