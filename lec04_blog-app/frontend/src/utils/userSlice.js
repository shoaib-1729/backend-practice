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
        logout(state, action) {
            localStorage.removeItem("user");
            return {
                token: null
            }
        },

        // update user
        updateUser(state, action) {
            const updatedState = {...state, ...action.payload }
            localStorage.setItem("user", JSON.stringify(updatedState))
            return updatedState;
        }
    },



})



export const { login, logout, updateUser } = userSlice.actions;
export default userSlice.reducer;