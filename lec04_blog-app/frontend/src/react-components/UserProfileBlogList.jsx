import { useParams, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import DisplayBlog from "./DisplayBlog";

const UserProfileBlogList = () => {
  const { username } = useParams();
  const location = useLocation();
  const userData = useUser();

  if (!userData) return null;

  // published stories
  if (location.pathname === `/${username}`) {
    return userData?.blogs && userData.blogs.length > 0 ? (
      <DisplayBlog data={userData?.blogs.filter((blog) => !blog?.draft)} />
    ) : (
      <p className="text-gray-500 italic">Write blog to publish your story.</p>
    );
  }

  // saved blogs
  if (location.pathname === `/${username}/saved-blogs`) {
    return userData?.savedBlogs?.length > 0 ? (
      <DisplayBlog data={userData?.savedBlogs.filter((blog) => !blog?.draft)} />
    ) : (
      <p className="text-gray-500 italic">No saved blogs to show.</p>
    );
  }

  // liked blogs
  if (location.pathname === `/${username}/liked-blogs`) {
    return userData?.likedBlogs?.length > 0 ? (
      <DisplayBlog data={userData?.likedBlogs.filter((blog) => !blog?.draft)} />
    ) : (
      <p className="text-gray-500 italic">No liked blogs to show.</p>
    );
  }

  if (location.pathname === `/${username}/draft-blogs`) {
    return userData?.blogs.filter((blog) => blog?.draft).length > 0 ? (
      <DisplayBlog data={userData?.blogs.filter((blog) => blog?.draft)} />
    ) : (
      <p className="text-gray-500 italic">No draft blogs to show.</p>
    );
  }

  return null;
};

export default UserProfileBlogList;
