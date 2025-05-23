import { Button } from "@/shadcn-components/ui/button";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { setIsOpen } from "../utils/commentSlice";
import { addNewComment, setCommentLike, setReplies } from "../utils/selectedBlogSlice";
import { useState } from "react";
import axios from "axios";
import { formatDate } from "../utils/formatDate";


const Comment = () => {
  const [comment, setComment] = useState("");
  
  
  // For toggling reply box per comment
  const [activeReply, setActiveReply] = useState(null);


  const dispatch = useDispatch();

  const { token, id: userId } = useSelector((state) => state.user);
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
      setComment(""); // Clear input
    } catch (err) {
      console.log(err);
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
        value={comment}
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
      <DisplayComments 
       comments={comments}
       token={token}
       blogId={id}
       userId={userId}
       activeReply={activeReply}
                  setActiveReply={setActiveReply}
      />
    </div>
  );
};



// display comments
const DisplayComments = (
  {
    comments,
    token,
    blogId,
    userId,
    activeReply,
    setActiveReply

  }
) => {


  const [reply, setReply] = useState("");

  const dispatch = useDispatch();


  // Toggle reply box for a specific comment
  function handleActiveReply(id) {
    setActiveReply((prev) => (prev === id ? null : id));
  }

   // Handle comment like
  async function handleCommentLike(commentId) {
    try {
      const res = await axios.patch(
        `http://localhost:3000/api/v1/blogs/like-comment/${commentId}`,
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
      console.log(err);
      toast.error(err.response.data.error);
    }
  }

  async function handleReply(parentCommentId){
    try{
      let res = await axios.post(
        `http://localhost:3000/api/v1/comment/${parentCommentId}/${blogId}`,
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
      dispatch(setReplies(res.data.newReply))
    
    }catch(err){
      console.log(err);
      //  toast.error(err.response.data.message);
    }
  }



 return (
  <>
    {comments.map((comment) => (
      <div key={comment._id} className="py-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <img
            src={`https://api.dicebear.com/9.x/initials/svg?seed=${comment.user.name}`}
            alt="avatar"
            className="w-8 h-8 rounded-full"
          />
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <p className="font-medium text-sm text-gray-800">{comment.user.name}</p>
              <p className="text-xs text-gray-400">{formatDate(comment.createdAt)}</p>
            </div>

            {/* Comment text */}
            <p className="mt-1 text-sm text-gray-700 leading-relaxed">
              {comment.comment}
            </p>

            {/* Actions: Like + Replies */}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <button
                onClick={() => handleCommentLike(comment._id)}
                className="flex items-center gap-1 hover:text-blue-500"
              >
                <i
                  className={`fi ${
                    comment.likes.includes(userId)
                      ? "fi-sr-thumbs-up"
                      : "fi-rr-social-network"
                  } text-base`}
                ></i>
                <span>{comment.likes.length}</span>
              </button>

              <button
                onClick={() => handleActiveReply(comment._id)}
                className="flex items-center gap-1 hover:text-blue-600"
              >
                <i className="fi fi-sr-comments text-base"></i>
                <span>{comment.replies.length}</span>
                <span className="underline">Replies</span>
              </button>
            </div>

            {/* Reply Input Box */}
            {activeReply === comment._id && (
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Write a reply..."
                  onChange={(e) => setReply(e.target.value)}
                  className="border border-gray-300 px-3 py-2 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                />
                <Button
                  onClick={() => handleReply(comment._id)}
                  className="mt-2 bg-green-500 hover:bg-green-600 text-white text-xs"
                >
                  Reply
                </Button>
              </div>
            )}

            {/* Nested Replies */}
            {comment.replies.length > 0 && (
              <div className="pl-5 mt-4 border-l border-gray-200">
                <DisplayComments
                  comments={comment.replies}
                  userId={userId}
                  blogId={blogId}
                  token={token}
                  activeReply={activeReply}
                  setActiveReply={setActiveReply}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    ))}
  </>
);

}

export default Comment;
