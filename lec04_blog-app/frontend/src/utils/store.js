import { configureStore } from '@reduxjs/toolkit'
import userSlice from "./userSlice"
import selectedBlogSlice from './selectedBlogSlice';
import commentSlice from './commentSlice.js'

const store = configureStore({
    reducer: {
        user: userSlice,
        selectedBlog: selectedBlogSlice,
        comment: commentSlice,
    }
})

export default store;