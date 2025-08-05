import toast from "react-hot-toast";
import { updateUser } from "./userSlice";
import axios from "axios";

<<<<<<< HEAD

export async function handleSaveBlog(blogId, token, setIsSaved, dispatch) {
=======
export async function handleSaveBlog(blogId, token, setIsSaved) {
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
    try {
        if (token) {
            setIsSaved((prev) => !prev);
            const res = await axios.patch(
                `http://localhost:3000/api/v1/save-blog/${blogId}`, {}, { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(res.data.message);
<<<<<<< HEAD
            console.log(res.data.user)
                // ✅ update user in Redux
            if (res.data.user) {
                dispatch(updateUser(res.data.user));
            }
=======
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
        }
    } catch (err) {
        console.error("Error saving blog:", err);
        toast.error(err.response.data.message);
    }
}


export async function handleFollowCreator(creatorId, token, setIsFollowCreator, dispatch) {
    try {
        if (token) {

            const res = await axios.patch(
                `http://localhost:3000/api/v1/follow/${creatorId}`, {}, { headers: { Authorization: `Bearer ${token}` } }
            );

            // Backend se updated user data mila hai
            if (res.data.user) {
                dispatch(updateUser(res.data.user));

            }

            // Based on response message, decide follow status
            if (res.data.message.includes("unfollowed")) {
                setIsFollowCreator(false);
            } else {
                setIsFollowCreator(true);
            }
            toast.success(res.data.message);
        }
    } catch (err) {
        console.error("Error following blog creator:", err);
        toast.error(err.response.data.message);
    }
}