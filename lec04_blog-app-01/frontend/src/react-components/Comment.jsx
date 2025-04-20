import { Button } from "@/shadcn-components/ui/button";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { setIsOpen } from "../utils/commentSlice";
import { addNewComment, setCommentLike } from "../utils/selectedBlogSlice";
import { useState } from "react";
import axios from "axios";
import { formatDate } from "../utils/formatDate";

const Comment = () => {
  const [comment, setComment] = useState([]);
  const dispatch = useDispatch();


  const { token, id: userId} = useSelector((state) => state.user);
  const { _id: id, comments } = useSelector((state) => state.selectedBlog);

  async function handleComment() {
    try {
      const res = await axios.post(
        `http://localhost:3000/api/v1/blogs/comment/${id}`,
        { comment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(addNewComment(res.data.newComment));
      toast.success(res.data.message);
    } catch (err) {
      console.log(err);
    }
  }
// handle comment like
  async function handleCommentLike(commentId){
    try{
        const res = await axios.patch(
            `http://localhost:3000/api/v1/blogs/like-comment/${commentId}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }
        )
        console.log(res);
        // dispatch action
        dispatch(setCommentLike({ commentId, userId }))
        toast.success(res.data.message);

    }catch(err){
        console.log(err);
        toast.error(err.response.data.error)
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

      {/* Input Box */}
      <input
        type="text"
        placeholder="Write a comment..."
        onChange={(e) => setComment(e.target.value)}
        className="border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-0 text-lg"
      />

      {/* Add Button */}
      <Button
        onClick={handleComment}
        className="mt-4 bg-green-500 hover:bg-green-600 text-white"
      >
        Add
      </Button>

      {/* Padding & Separator */}
      <div className="my-6 border-t border-gray-300"></div>

      {/* Render Comments */}
      {comments.map((comment) => (
        <div key={comment._id} className="border-b border-gray-200 py-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <img
                src={`https://api.dicebear.com/9.x/initials/svg?seed=${comment.user.name}`}
                alt="avatar"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-semibold text-sm">{comment.user.name}</p>
                <p className="text-xs text-gray-500">
                  {formatDate(comment.createdAt)}
                </p>
              </div>
            </div>
            <i className="fi fi-bs-menu-dots text-gray-500 text-lg cursor-pointer hover:text-gray-700"></i>
          </div>

          {/* Comment text */}
          <p className="mt-3 text-sm text-gray-800 leading-snug">
            {comment.comment}
          </p>

          {/* Footer: Like + Comment */}
          <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
            {/* Like */}
            <div className="flex items-center gap-2 cursor-pointer hover:text-blue-500" onClick={() => handleCommentLike(comment._id)}>
              <i className={`fi ${comment.likes.includes(userId) ? "fi-sr-thumbs-up" : "fi-rr-social-network"}  text-xl hover:text-blue-500`}></i>
              <span>{comment.likes.length}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Comment;
