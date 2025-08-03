import axios from "axios";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, Outlet, useParams } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { handleFollowCreator } from "../utils/helperFunc";

// import { formatDate } from "../utils/formatDate";
// import { handleFollowCreator, handleSaveBlog } from "../utils/helperFunc";

const UserProfile = () => {
  const { username } = useParams();
  const [isFollowCreator, setIsFollowCreator] = useState(false);
  const [userData, setUserData] = useState();
  const { token, id: userId, profilePic } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const newName = username.split("@")[1];
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/users/${newName}`);
        setUserData(res.data.user);
      } catch (err) {
        console.log(err);
      }
    };
    fetchUserProfile();
  }, [username]);

  useEffect(() => {
    if (userData?.followers) {
      const isFollower = userData.followers.some(f => f._id === userId);
      setIsFollowCreator(isFollower);
    }
  }, [userData]);

  if (!userData) return <h1 className="text-center mt-20 text-lg font-semibold text-gray-600">Loading...</h1>;

  return (
    <div className="flex justify-center bg-white px-4 pt-10 pb-20 min-h-screen text-gray-900">
      <div className="flex w-full max-w-7xl border border-gray-200 bg-white rounded-lg shadow-sm p-8 gap-10">
        {/* Left Column */}
        <div className="flex-1 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6 px-2">
            <h1 className="text-2xl font-bold">{userData?.name}</h1>
            <i className="fi fi-rr-menu-dots text-gray-500 cursor-pointer"></i>
          </div>

          <div className="flex border-b border-gray-200 mb-6 px-2 space-x-4">
<NavLink
  to=""
  end
  className={({ isActive }) =>
    isActive
      ? "pb-2 text-sm border-b-2 border-black text-black"
      : "pb-2 text-sm text-gray-500 hover:text-black"
  }
>
  Home
</NavLink>
            
          <NavLink
  to={`/${username}/lists`}
  className={({ isActive }) =>
    isActive
      ? "pb-2 text-sm border-b-2 border-black text-black"
      : "pb-2 text-sm text-gray-500 hover:text-black"
  }
>
  Lists
</NavLink>
      
             <NavLink
    to="about"
    className={({ isActive }) =>
      isActive
        ? "pb-2 text-sm border-b-2 border-black text-black"
      : "pb-2 text-sm text-gray-500 hover:text-black"
    }
  >
    About
  </NavLink>
          </div>



<UserContext.Provider value={userData}>
  <Outlet />
</UserContext.Provider>
        </div>

        {/* Right Column */}
        <div className="w-full md:w-72 flex flex-col items-center sticky top-20 border-l border-gray-100 pl-6">
          <img
            src={
              profilePic
                ? profilePic
                : `https://api.dicebear.com/9.x/initials/svg?seed=${userData?.name}`
            }
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover border shadow-sm"
          />
          <h1 className="text-lg font-semibold mt-4">{userData?.name}</h1>
          <p className="text-sm text-gray-500">{userData?.followers?.length} followers</p>
          <p className="text-center text-gray-600 text-sm mt-2">{userData?.bio}</p>

          <button
            className="mt-4 bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition text-sm"
          >
            {userData?._id === userId ? (
              <Link to="/edit-profile">Edit Profile</Link>
            ) : (
              <span
                onClick={() =>
                  handleFollowCreator(userData?._id, token, setIsFollowCreator, dispatch)
                }
              >
                {isFollowCreator ? "Following" : "Follow"}
              </span>
            )}
          </button>

          {/* Following List */}
          <div className="w-full mt-10">
            <h2 className="text-md font-semibold mb-4 px-1">Following</h2>
            <div className="flex flex-col gap-3">
              {userData?.following.map((following) => (
                <div
                  key={following._id}
                  className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-md transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://api.dicebear.com/9.x/initials/svg?seed=${following?.name}`}
                      alt="avatar"
                      className="w-7 h-7 rounded-full object-cover border"
                    />
                    <Link to={`/@${following?.username}`}>
                      <span className="text-sm text-gray-800 hover:underline">
                        {following?.name}
                      </span>
                    </Link>
                  </div>
                  <i className="fi fi-rr-menu-dots text-gray-400 text-xs cursor-pointer"></i>
                </div>
              ))}
            </div>
          </div>

          <a
            href="mailto:adarshguptaworks@gmail.com"
            className="mt-4 text-blue-500 underline text-sm"
          >
            Contact Me
          </a>
          <a
            href="https://twitter.com/adarsh____gupta/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 text-blue-500 underline text-sm"
          >
            Twitter
          </a>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
