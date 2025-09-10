import { Button } from "@/shadcn-components/ui/button";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { setIsOpen } from "../utils/commentSlice";
import {
  addNewComment,
  deleteCommentAndReply,
  setCommentLike,
  setReplies,
  setUpdatedComments,
} from "../utils/selectedBlogSlice";
import { useState } from "react";
import axios from "axios";
import { formatDate } from "../utils/formatDate";

const Comment = () => {
  const [comment, setComment] = useState("");

  // For toggling reply box per comment
  const [activeReply, setActiveReply] = useState(null);

  // states for 3 dots popoup
  const [currentPopup, setCurrentPopup] = useState(null);

  // states for edit comment div show
  const [currentEditComment, setCurrentEditComment] = useState(null);

  const dispatch = useDispatch();

  const { token, id: userId } = useSelector((state) => state.user);
  const {
    _id: id,
    comments,
    creator: { _id: creatorId },
  } = useSelector((state) => state.selectedBlog);

  async function handleComment() {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/comment/${id}`,
        { comment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(addNewComment(res.data.newComment));
      toast.success(res.data.message);
      setComment(""); // Clear input
    } catch (err) {
      toast.error(err.response.data.message);
    }
  }

  return (
    <div className="bg-white drop-shadow-lg border-l border-gray-200 h-screen fixed top-0 right-0 w-[400px] p-6 flex flex-col overflow-y-scroll">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-lg font-medium">Comment ({comments.length})</span>
        <i
          onClick={() => dispatch(setIsOpen(false))}
          className="fi fi-br-cross text-gray-500 hover:text-gray-700 cursor-pointer text-xl"
        ></i>
      </div>

      <textarea
        rows={3}
        placeholder="What are your thoughts?"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full min-h-[10rem] bg-gray-100 border border-transparent focus:border-gray-400 p-3 rounded-md text-md focus:outline-none resize-none transition-colors duration-200 placeholder:text-black/30"
      />

      {/* Add Button */}
      <Button
        onClick={handleComment}
        className="mt-4 bg-black text-white cursor-pointer"
      >
        Add
      </Button>

      {/* Padding & Separator */}
      <div className="my-6 border-t border-gray-300"></div>

      {/* Render Comments */}
      <DisplayComments
        comments={comments}
        token={token}
        blogId={id}
        userId={userId}
        activeReply={activeReply}
        setActiveReply={setActiveReply}
        currentPopup={currentPopup}
        setCurrentPopup={setCurrentPopup}
        currentEditComment={currentEditComment}
        setCurrentEditComment={setCurrentEditComment}
        creatorId={creatorId}
      />
    </div>
  );
};

// display comments
const DisplayComments = ({
  comments,
  token,
  blogId,
  userId,
  activeReply,
  setActiveReply,
  currentPopup,
  setCurrentPopup,
  currentEditComment,
  setCurrentEditComment,
  creatorId,
}) => {
  const [reply, setReply] = useState("");

  // edit comment
  const [updatedCommentContent, setUpdatedCommentContent] = useState("");

  const dispatch = useDispatch();

  // Toggle reply box for a specific comment
  function handleActiveReply(id) {
    setActiveReply((prev) => (prev === id ? null : id));
  }

  // Handle comment like
  async function handleCommentLike(commentId) {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/like-comment/${commentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(setCommentLike({ commentId, userId }));
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err?.response?.data?.message);
    }
  }

  // Handle comment like
  async function handleCommentUpdate(commentId) {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/edit-comment/${commentId}`,
        { updatedCommentContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(res.data.message);

      dispatch(setUpdatedComments(res.data.updatedComment));
    } catch (err) {
      toast.error(err.response.data.message);
    } finally {
      // khaali kardo textarea ko
      setUpdatedCommentContent("");
      // comment ko phir se dikha do
      setCurrentEditComment(null);
    }
  }

  // handle comment delete
  async function handleCommentDelete(commentId) {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/comment/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(res.data.message);
      dispatch(deleteCommentAndReply(commentId));
    } catch (err) {
      toast.error(err.response.data.message);
    }
  }

  async function handleReply(parentCommentId) {
    try {
      let res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/comment/${parentCommentId}/${blogId}`,
        { reply },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setReply(null);
      setActiveReply(null);

      // dispatch action
      dispatch(setReplies(res.data.newReply));
    } catch (err) {
      toast.error(err.response.data.message);
    }
  }

  return (
    <>
      {comments.map((comment) => (
        <div key={comment._id} className="py-4">
          {currentEditComment === comment._id ? (
            <div className="mt-2">
              <textarea
                rows={3}
                value={updatedCommentContent}
                onChange={(e) => setUpdatedCommentContent(e.target.value)}
                placeholder="Edit your response..."
                className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
              />

              <div className="mt-2 flex justify-end gap-3">
                {/* Cancel Button */}
                <button
                  onClick={() => {
                    setCurrentEditComment(null);
                    setUpdatedCommentContent("");
                  }}
                  className="px-4 py-1.5 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
                >
                  Cancel
                </button>

                {/* Update Button */}
                <button
                  onClick={() => handleCommentUpdate(comment._id)}
                  className="px-4 py-1.5 text-sm text-white bg-black rounded transition-colors duration-200 cursor-pointer"
                >
                  Update
                </button>
              </div>
            </div>
          ) : (
            // Outer container
            <div className="flex items-start gap-3 relative">
              {/* Avatar */}
              <img
                src={
                  comment?.user?.profilePic
                    ? comment?.user?.profilePic
                    : `https://api.dicebear.com/9.x/initials/svg?seed=${comment?.user?.name}`
                }
                alt="avatar"
                className="w-8 h-8 rounded-full"
              />

              {/* Main content */}
              <div className="flex-1">
                {/* Name + Date */}
                <div>
                  <p className="font-medium text-sm text-gray-800">
                    {comment.user.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(comment.createdAt)}
                  </p>
                </div>

                {/* Comment text */}
                <p className="mt-1 text-sm text-gray-700 leading-relaxed">
                  {comment.comment}
                </p>

                {/* Like + Reply buttons */}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <button
                    onClick={() => handleCommentLike(comment._id)}
                    className="flex items-center gap-1 hover:text-blue-500"
                  >
                    <i
                      className={`fi ${
                        comment.likedBy.includes(userId)
                          ? "fi-sr-thumbs-up"
                          : "fi-rr-social-network"
                      } text-base`}
                    ></i>
                    <span>{comment.likedBy.length}</span>
                  </button>

                  <button
                    onClick={() => handleActiveReply(comment._id)}
                    className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"
                  >
                    <i className="fi fi-sr-comments text-base"></i>
                    <span>{comment.replies.length}</span>
                    <span className="underline">Replies</span>
                  </button>
                </div>

                {/* Reply Input */}
                {activeReply === comment._id && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={reply}
                      placeholder="Write a reply..."
                      onChange={(e) => setReply(e.target.value)}
                      className="border border-gray-300 px-3 py-2 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                    />
                    <Button
                      onClick={() => handleReply(comment._id)}
                      className="mt-2 bg-black  text-white text-xs cursor-pointer"
                    >
                      Reply
                    </Button>
                  </div>
                )}

                {/* Nested replies */}
                {comment.replies.length > 0 && (
                  <div className="pl-5 mt-4 border-l border-gray-200">
                    <DisplayComments
                      comments={comment.replies}
                      userId={userId}
                      blogId={blogId}
                      token={token}
                      activeReply={activeReply}
                      setActiveReply={setActiveReply}
                      currentPopup={currentPopup}
                      setCurrentPopup={setCurrentPopup}
                      currentEditComment={currentEditComment}
                      setCurrentEditComment={setCurrentEditComment}
                      creatorId={creatorId}
                    />
                  </div>
                )}
              </div>

              {/* 3-dot icon + dropdown menu with arrow */}
              <div className="absolute top-0 right-0">
                <div className="relative">
                  {(userId === comment.user._id || userId === creatorId) && (
                    <button
                      className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer transition-colors"
                      onClick={() => {
                        setCurrentPopup((prev) =>
                          prev === comment._id ? null : comment._id
                        );
                      }}
                    >
                      <i className="fi fi-sr-menu-dots"></i>
                    </button>
                  )}

                  {
                    // Dropdown menu below 3 dots
                    currentPopup === comment._id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 shadow-lg rounded-md z-10 overflow-hidden ">
                        {/* Arrow pointing to 3 dots */}
                        <div className="absolute -top-2 right-3 w-3 h-3 bg-white rotate-45 border-l border-t border-gray-200"></div>

                        {comment.user._id === userId && (
                          <button
                            onClick={() => {
                              setUpdatedCommentContent(comment.comment);
                              setCurrentEditComment(comment._id);
                              setCurrentPopup(null);
                            }}
                            className="w-full px-4 py-2 text-sm text-gray-500 hover:text-black text-left cursor-pointer transition-opacity duration-200"
                          >
                            Edit Response
                          </button>
                        )}
                        <button
                          onClick={() => handleCommentDelete(comment._id)}
                          className="w-full px-4 py-2 text-sm text-red-400 hover:text-red-700 text-left cursor-pointer transition-opacity duration-200"
                        >
                          Delete Response
                        </button>
                      </div>
                    )
                  }
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export default Comment;
