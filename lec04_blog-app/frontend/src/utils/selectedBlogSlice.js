import { createSlice } from "@reduxjs/toolkit";

const selectedBlogSlice = createSlice({
    name: "selectedBlogSlice",
    initialState: JSON.parse(localStorage.getItem("selectedBlog")) || {},
    reducers: {
        addSelectedBlog(state, action) {
            localStorage.setItem("selectedBlog", JSON.stringify(action.payload));
            return action.payload;
        },

        removeSelectedBlog(state, action) {
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
            const { commentId, userId } = action.payload;
            // find comment
            const comment = state.comments.find((c) => c._id === commentId);

            if (!comment) {
                return;
            }

            if (!Array.isArray(comment.likedBy)) {
                comment.likedBy = [];
            }
            const alreadyLiked = comment.likedBy.includes(userId);

            if (alreadyLiked) {
                // Unlike
                comment.likedBy = comment.likedBy.filter((like) => like !== userId);
            } else {
                // Like
                comment.likedBy = [...comment.likedBy, userId];
            }
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
                                replies: [...comment.replies, newReply]
                            }
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
                                        return reply._id = parentComment._id ? parentComment : reply;
                                    })

                                }
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
                return comment._id == parentComment._id ? parentComment : comment
            })
        },

        // update comment and replies
        setUpdatedComments(state, action) {

            function updateCommentAndReply(comments) {

                return comments.map((comment) =>
                    comment._id === action.payload._id ? {
                        ...comment,
                        comment: action.payload.comment
                    } :
                    comment.replies && comment.replies.length > 0 ? {
                        ...comment,
                        replies: updateCommentAndReply(comment.replies)
                    } :
                    comment
                )
            }

            state.comments = updateCommentAndReply(state.comments)

        },

    }
});

export const { addSelectedBlog, removeSelectedBlog, changeLikes, addNewComment, setCommentLike, setReplies, setUpdatedComments } = selectedBlogSlice.actions;
export default selectedBlogSlice.reducer;