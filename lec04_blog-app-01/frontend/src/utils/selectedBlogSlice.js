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
            if (state.likes.includes(userId)) {
                state.likes = state.likes.filter((like) => like !== userId);
            } else {
                state.likes = [...state.likes, userId];
            }

            return state;
        }
    }
});

export const { addSelectedBlog, removeSelectedBlog, changeLikes } = selectedBlogSlice.actions;
export default selectedBlogSlice.reducer;