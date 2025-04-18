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

            const alreadyLiked = state.likes.includes(userId);

            if (alreadyLiked) {
                // Unlike
                state.likes = state.likes.filter((like) => like !== userId);
            } else {
                // Like
                state.likes = [...state.likes, userId];
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

            if (!Array.isArray(comment.likes)) {
                comment.likes = [];
            }
            const alreadyLiked = comment.likes.includes(userId);

            if (alreadyLiked) {
                // Unlike
                comment.likes = comment.likes.filter((like) => like !== userId);
            } else {
                // Like
                comment.likes = [...comment.likes, userId];
            }
        }

    }
});

export const { addSelectedBlog, removeSelectedBlog, changeLikes, addNewComment, setCommentLike } = selectedBlogSlice.actions;
export default selectedBlogSlice.reducer;
``