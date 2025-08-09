import { useParams, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import DisplayBlog from "./DisplayBlog";

const UserProfileBlogList = () => {
  const { username } = useParams();
  const location = useLocation();
  const userData = useUser();

  if (!userData) return null;

  if (location.pathname === `/${username}`) {
    return <DisplayBlog data={userData?.blogs?.filter(blog => !blog?.draft)} />;
  }

  if (location.pathname === `/${username}/saved-blogs`) {
    return <DisplayBlog data={userData?.savedBlogs || []} />;
  }

  if (location.pathname === `/${username}/liked-blogs`) {
    return <DisplayBlog data={userData?.likedBlogs || []} />;
  }

  if (location.pathname === `/${username}/draft-blogs`) {
    return <DisplayBlog data={userData?.blogs?.filter(blog => blog?.draft)} />;
  }

  return null;
};

export default UserProfileBlogList;
