import { createSlice } from '@reduxjs/toolkit'

const userSlice = createSlice({
    name: "userSlice",
    initialState: JSON.parse(localStorage.getItem("user")) || {
        token: null
    },
    reducers: {
        // login user
        login(state, action) {
            localStorage.setItem("user", JSON.stringify(action.payload));
            return action.payload
        },

        // logout user
        logout() {}
    },



})



export const { login, logout } = userSlice.actions;
export default userSlice.reducer;