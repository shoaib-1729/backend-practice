import { createSlice } from "@reduxjs/toolkit";

const selectedBlogSlice = createSlice({
  name: "selectedBlogSlice",
  initialState: JSON.parse(localStorage.getItem("selectedBlog")) || {},
  reducers: {
    addSelectedBlog(_, action) {
      localStorage.setItem("selectedBlog", JSON.stringify(action.payload));
      return action.payload;
    },

    removeSelectedBlog() {
      // Remove item from localStorage
      localStorage.removeItem("selectedBlog");
      return {};
    },

    // Handle likes
    changeLikes(state, action) {
      const userId = action.payload;
      // action.payload -> userID (for liking/unliking)
      // like array -> list of userId's who liked the particular blog

      const alreadyLiked = state.likedBy.includes(userId);

      if (alreadyLiked) {
        // Unlike
        state.likedBy = state.likedBy.filter((like) => like !== userId);
      } else {
        // Like
        state.likedBy = [...state.likedBy, userId];
      }

      return state;
    },

    // set comments
    addNewComment(state, action) {
      state.comments = [...state.comments, action.payload];
    },

    // set comment likes
    setCommentLike(state, action) {
      let { commentId, userId } = action.payload;

      function toogleLike(comments) {
        return comments.map((comment) => {
          if (comment._id == commentId) {
            if (comment.likedBy.includes(userId)) {
              comment.likedBy = comment.likedBy.filter(
                (like) => like !== userId
              );
              return comment;
            } else {
              comment.likedBy = [...comment.likedBy, userId];
              return comment;
            }
          }

          if (comment.replies && comment.replies.length > 0) {
            return { ...comment, replies: toogleLike(comment.replies) };
          }

          return comment;
        });
      }
      state.comments = toogleLike(state.comments);
    },

    // add new reply
    setReplies(state, action) {
      let newReply = action.payload;

      function findParentComment(comments) {
        let parentComment;

        // parent comment pata lagao
        for (let comment of comments) {
          // case-1: comment ka reply (parent find karo)
          if (comment._id === newReply.parentComment) {
            // add reply to parent comemnt
            parentComment = {
              ...comment,
              replies: [...comment.replies, newReply],
            };
            // jaise parent mil jaaye loop break kardo (pita ji ek hi hoge)
            break;
          }

          // case-2: comment ke reply ka bhi reply
          // abb reply parent comment bann jaayega
          // bss joh cheez parent ke saath kari thi wahi same cheez karni hai magar abb woh reply ke saath karni hai
          if (comment.replies.length > 0) {
            // find parent comment - recursion lagega
            parentComment = findParentComment(comment.replies);

            // agar parent commemnt mila
            if (parentComment) {
              // parent comment ko mutate kardo (replies array ko change)
              parentComment = {
                ...comment,
                replies: comment.replies.map((reply) => {
                  return (reply._id = parentComment._id
                    ? parentComment
                    : reply);
                }),
              };
              // jab parent mil jaaaye break kardo
              break;
            }
          }
        }
        // yeh top level comment ko return kar rahe (replies usmei add karke)
        return parentComment;
      }

      let parentComment = findParentComment(state.comments);

      // state par set kardo
      state.comments = state.comments.map((comment) => {
        return comment._id == parentComment._id ? parentComment : comment;
      });
    },

    // update comment and replies
    setUpdatedComments(state, action) {
      function updateCommentAndReply(comments) {
        return comments.map((comment) =>
          comment._id === action.payload._id
            ? {
                ...comment,
                comment: action.payload.comment,
              }
            : comment.replies && comment.replies.length > 0
            ? {
                ...comment,
                replies: updateCommentAndReply(comment.replies),
              }
            : comment
        );
      }

      state.comments = updateCommentAndReply(state.comments);
    },

    deleteCommentAndReply(state, action) {
      function deleteComment(comments) {
        return comments
          .filter((comment) => comment._id !== action.payload)
          .map((comment) =>
            comment.replies && comment.replies.length > 0
              ? { ...comment, replies: deleteComment(comment.replies) }
              : comment
          );
      }

      state.comments = deleteComment(state.comments);
    },
  },
});

export const {
  addSelectedBlog,
  removeSelectedBlog,
  changeLikes,
  addNewComment,
  setCommentLike,
  setReplies,
  setUpdatedComments,
  deleteCommentAndReply,
} = selectedBlogSlice.actions;
export default selectedBlogSlice.reducer;
