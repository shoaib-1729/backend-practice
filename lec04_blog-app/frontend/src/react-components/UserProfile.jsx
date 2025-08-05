import axios from "axios";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, Outlet, useParams } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { handleFollowCreator } from "../utils/helperFunc";

const UserProfile = () => {
  const { username } = useParams();
  const [isFollowCreator, setIsFollowCreator] = useState(false);
  const [userData, setUserData] = useState(null);

  const {
    token,
    id: userId,
    blogs,
    profilePic,
  } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const newName = username.split("@")[1];
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/users/${newName}`
        );
        setUserData(res.data.user);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserProfile();
  }, [username]);

  useEffect(() => {
    if (userData?.followers) {
      const isFollower = userData.followers.some((f) => f._id === userId);
      setIsFollowCreator(isFollower);
    }
  }, [userData]);

  if (!userData)
    return (
      <h1 className="text-center mt-20 text-lg font-semibold text-gray-600">
        Loading...
      </h1>
    );

  return (
    <div className="flex justify-center px-4 pt-10 pb-20 bg-white min-h-screen text-gray-900">
      <div className="flex flex-col lg:flex-row w-full max-w-7xl border border-gray-200 bg-white rounded-lg shadow-sm p-6 gap-10">
        {/* Left Column */}
        <div className="flex-1">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{userData?.name}</h1>
                <p className="text-4xl font-semibold font-serif leading-tight tracking-tight text-gray-900">
                  <span className="text-gray-400"> / </span>
                  <span className="text-gray-600 text-lg font-normal">
                    {blogs?.length === 1
                      ? `1 story`
                      : `${blogs?.length} stories`}
                  </span>
                </p>
                <hr className="mt-4 border-gray-300" />
              </div>
              {/* More options icon */}
              <i className="fi fi-rr-menu-dots text-gray-500 cursor-pointer"></i>
            </div>

            {/* Nav Links */}
            <div className="flex border-b border-gray-200 space-x-6 mt-4">
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
                to={`/${username}/list`}
                className={({ isActive }) =>
                  isActive
                    ? "pb-2 text-sm border-b-2 border-black text-black"
                    : "pb-2 text-sm text-gray-500 hover:text-black"
                }
              >
                List
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
          </div>

          {/* Outlet with userData in context */}
          <UserContext.Provider value={userData}>
            <Outlet />
          </UserContext.Provider>
        </div>

        {/* Right Column */}
        <aside className="w-full lg:w-72 flex flex-col items-center sticky top-20 border-l border-gray-100 pl-6">
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
          <p className="text-sm text-gray-500">
            {userData?.followers?.length} followers
          </p>
          {userData?.bio ? (
            <p className="mt-3 text-sm text-gray-600 leading-relaxed text-center max-w-xs">
              {userData.bio}
            </p>
          ) : (
            <p className="mt-3 text-sm text-gray-400 italic text-center max-w-xs">
              No bio added yet.
            </p>
          )}

          {/* Follow / Edit Button */}
          <div className="mt-4 w-full">
            {userData?._id === userId ? (
              <Link
                to="/edit-profile"
                className="block text-center bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition text-sm"
              >
                Edit Profile
              </Link>
            ) : (
              <button
                onClick={() =>
                  handleFollowCreator(
                    userData?._id,
                    token,
                    setIsFollowCreator,
                    dispatch
                  )
                }
                className="w-full bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition text-sm"
              >
                {isFollowCreator ? "Following" : "Follow"}
              </button>
            )}
          </div>

          {/* Following List */}
          {userData?.following?.length > 0 && (
            <div className="w-full mt-10">
              <h2 className="text-md font-semibold mb-4">Following</h2>
              <div className="flex flex-col gap-3">
                {userData.following.map((f) => (
                  <div
                    key={f._id}
                    className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-md transition"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://api.dicebear.com/9.x/initials/svg?seed=${f.name}`}
                        alt="avatar"
                        className="w-7 h-7 rounded-full object-cover border"
                      />
                      <Link to={`/@${f.username}`}>
                        <span className="text-sm text-gray-800 hover:underline">
                          {f.name}
                        </span>
                      </Link>
                    </div>
                    <i className="fi fi-rr-menu-dots text-gray-400 text-xs cursor-pointer"></i>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default UserProfile;
