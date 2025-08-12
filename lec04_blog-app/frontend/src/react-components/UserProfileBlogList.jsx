import { useParams, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import DisplayBlog from "./DisplayBlog";
import { useSelector } from "react-redux";

const UserProfileBlogList = () => {
  const { username } = useParams();
  // const {showLikedBlogs,showDraftBlogs, showSavedBlogs} = useSelector(
  //     (state) => state.user
  //   );
  const location = useLocation();
  const userData = useUser();

  if (!userData) return null;

  // published stories
  if (location.pathname === `/${username}`) {
    return userData?.blogs && userData.blogs.length > 0 ? (
      <DisplayBlog data={userData?.blogs} />
    ) : (
      <p className="text-gray-500 italic">
        This user hasn’t published any stories yet.
      </p>
    );
  }

  // saved blogs
  if (location.pathname === `/${username}/saved-blogs`) {
    if (!userData?.showSavedBlogs) {
      return (
        <p className="text-gray-500 italic">
          This user has not allowed saved blogs to be visible.
        </p>
      );
    }
    return userData?.savedBlogs?.length > 0 ? (
      <DisplayBlog data={userData?.savedBlogs} />
    ) : (
      <p className="text-gray-500 italic">No saved blogs to show.</p>
    );
  }

// liked blogs
  if (location.pathname === `/${username}/liked-blogs`) {
    if (!userData?.showLikedBlogs) {
      return (
        <p className="text-gray-500 italic">
          This user has not allowed liked blogs to be visible.
        </p>
      );
    }
    return userData?.likedBlogs?.length > 0 ? (
      <DisplayBlog data={userData?.savedBlogs} />
    ) : (
      <p className="text-gray-500 italic">No liked blogs to show.</p>
    );
  }

  // draft blogsp
  if (location.pathname === `/${username}/draft-blogs`) {
    if (!userData?.showDraftBlogs) {
      return (
        <p className="text-gray-500 italic">
          This user has not allowed draft blogs to be visible.
        </p>
      );
    }
    return userData?.draftBlogs?.length > 0 ? (
      <DisplayBlog data={userData?.draftBlogs} />
    ) : (
      <p className="text-gray-500 italic">No draft blogs to show.</p>
    );
  }

  return null;
};

export default UserProfileBlogList;
