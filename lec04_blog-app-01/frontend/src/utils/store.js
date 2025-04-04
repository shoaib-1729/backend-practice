import { configureStore } from '@reduxjs/toolkit'
import userSlice from "./userSlice"
import selectedBlogSlice from './selectedBlogSlice';

const store = configureStore({
    reducer: {
        user: userSlice,
        selectedBlog: selectedBlogSlice
    }
})

export default store;