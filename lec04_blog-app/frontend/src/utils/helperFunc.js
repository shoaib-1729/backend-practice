import toast from "react-hot-toast";
import { logout, updateUser } from "./userSlice";
import axios from "axios";

export async function handleSaveBlog(blogId, token, setIsSaved, dispatch) {
  try {
    if (token) {
      setIsSaved((prev) => !prev);
      const res = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/save-blog/${blogId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);
      console.log(res.data.user);
      // ✅ update user in Redux
      if (res.data.user) {
        dispatch(updateUser(res.data.user));
      }
    }
  } catch (err) {
    console.error("Error saving blog:", err);
    toast.error(err.response.data.message);
  }
}

export async function handleDeleteBlog(blogId, token, dispatch) {
  try {
    if (token) {
      const res = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/blogs/${blogId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);
      console.log(res.data.user);
      // update user in Redux
      if (res.data.user) {
        dispatch(updateUser(res.data.user));
      }
    }
  } catch (err) {
    console.error("Error saving blog:", err);
    toast.error(err.response.data.message);
  }
}
export async function handleDeleteUser(
  token,
  savedBlogs,
  likedBlogs,
  setShowDeleteDropdown,
  dispatch
) {
  try {
    if (token) {
      const res = await axios.delete(`${import.meta.env.VITE_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowDeleteDropdown(false);
      console.log("delete user api call ke baad:", res);

      if (res.status == 200) {
        toast.success(res.data.message);

        if (res.data.deletedBlogIds.length > 0) {
          dispatch(
            updateUser({
              savedBlogs: savedBlogs.filter(
                (blog) => !res.data.deletedBlogIds.includes(blog._id)
              ),
              likedBlogs: likedBlogs.filter(
                (blog) => !res.data.deletedBlogIds.includes(blog._id)
              ),
            })
          );
        }

        // Logout user
        dispatch(logout());
      }
    }
  } catch (err) {
    console.error("Error deleting user:", err);
    toast.error(err.response.data.message);
    setShowDeleteDropdown(false);
  }
}

export async function handleFollowCreator(
  creatorId,
  token,
  setIsFollowCreator,
  dispatch
) {
  try {
    if (token) {
      // Optimistic update - pehle UI update karo
      setIsFollowCreator((prev) => !prev);

      const res = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/follow/${creatorId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Backend se updated user data mila hai
      if (res.data.user) {
        // Redux store update karo
        dispatch(updateUser(res.data.user));

        // Updated user data se actual follow status determine karo
        const isNowFollowing = res.data.user.following.some(
          (followedUser) =>
            followedUser._id === creatorId || followedUser === creatorId
        );

        // Local state ko backend data se sync karo
        setIsFollowCreator(isNowFollowing);

        toast.success(res.data.message);
      }
    }
  } catch (err) {
    // Error ke case mein optimistic update ko revert karo
    setIsFollowCreator((prev) => !prev);

    console.error("Error following blog creator:", err);
    toast.error(err.response.data.message || "Error following creator");
  }
}
