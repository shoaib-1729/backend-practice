import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { handleFollowCreator } from "../utils/helperFunc";
import DeleteConfirmation from "./DeleteConfirmation";
import toast from "react-hot-toast";

const UserProfile = () => {
  const { username } = useParams();
  const location = useLocation();
  const [isFollowCreator, setIsFollowCreator] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showDeleteDropdown, setShowDeleteDropdown] = useState(false);
  const navigate = useNavigate();

  const {
    token,
    followers,
    id: userId,
    savedBlogs,
    likedBlogs,
    bio,
  } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const dropdownRef = useRef(null);
  const dropdownButtonRef = useRef(null);

  // dropdown close on outside mouse click
  useEffect(() => {
    function handleClickOutside(event) {
      // Check if click is outside both dropdown and button
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        dropdownButtonRef.current &&
        !dropdownButtonRef.current.contains(event.target)
      ) {
        setShowDeleteDropdown(false);
      }
    }

    if (showDeleteDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDeleteDropdown]);
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const newName = username?.split("@")[1];
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/users/${newName}`
        );
        setUserData(res.data.user);
      } catch (err) {
        const errorMessage =
          err?.response?.data?.message ||
          "Something went wrong. Please try again.";
        toast.error(errorMessage);
      }
    };
    fetchUserProfile();
  }, [username]);

  useEffect(() => {
    // 1. Check follower
    if (userData?.followers) {
      const isFollower = userData.followers.some((f) => f._id === userId);
      setIsFollowCreator(isFollower);
    }

    // 2. Redirect if trying to access someone else's draft blogs
    if (
      (userData?._id !== userId &&
        !userData?.showDraftBlogs &&
        location.pathname === `/${username}/draft-blogs`) ||
      (userData?._id !== userId &&
        !userData?.showLikedBlogs &&
        location.pathname === `/${username}/liked-blogs`) ||
      (userData?._id !== userId &&
        !userData?.showSavedBlogs &&
        location.pathname === `/${username}/saved-blogs`)
    ) {
      navigate(`/${username}`);
    }
  }, [location.pathname, userData, userId, username, navigate]);

  const handleDropdownItemClick = (callback) => {
    if (callback) callback();
    setShowDeleteDropdown(false);
  };

  if (!userData)
    return (
      <h1 className="text-center mt-20 text-lg font-semibold text-gray-600">
        Loading...
      </h1>
    );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 pt-6 lg:pt-10 pb-20">
        {/* Mobile Profile Header - Only visible on mobile */}
        <div className="mb-6 lg:hidden">
          <div className="p-6 text-center relative">
            {/* Settings/Options Button for Mobile - Top Right */}
            {userData?._id === userId && (
              <div className="absolute top-4 right-4">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteDropdown(!showDeleteDropdown);
                    }}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <i className="fi fi-rr-menu-dots text-gray-600 text-lg cursor-pointer"></i>
                  </button>

                  {/* Dropdown Menu */}
                  {showDeleteDropdown && (
                    <div
                      ref={dropdownRef}
                      className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link
                        to="/edit-profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => handleDropdownItemClick()}
                      >
                        <i className="fi fi-rr-edit mr-3 text-gray-500"></i>
                        Edit Profile
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <DeleteConfirmation
                          type="user"
                          item={userData}
                          setShowDeleteDropdown={setShowDeleteDropdown}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Profile Image */}
            <img
              src={
                userData?.profilePic
                  ? userData?.profilePic
                  : `https://api.dicebear.com/9.x/initials/svg?seed=${userData?.name}`
              }
              alt="avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mx-auto mb-4"
            />

            {/* Name + Followers */}
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {userData?.name}
              </h1>
              <p className="text-base text-gray-600 font-medium">
                {followers?.length} followers
              </p>
            </div>

            {/* Username */}
            <p className="text-base text-gray-600 font-mono mt-1">
              {userData?.username}
            </p>

            {/* Bio */}
            {userData?.bio ? (
              <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto mb-6">
                {userData.bio}
              </p>
            ) : (
              <p className="text-sm text-gray-400 italic mb-6">
                You can edit your profile to add your bio.
              </p>
            )}

            {/* Follow/Edit Button - Reduced width, not full width */}
            {userData?._id === userId ? (
              <Link
                to="/edit-profile"
                className="block w-4/5 mx-auto bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-all duration-200 text-base font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                onClick={() => setShowDeleteDropdown(false)}
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
                className="w-4/5 bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-all duration-200 text-base font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
              >
                {isFollowCreator ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex lg:gap-8">
          {/* Left Column - Content */}
          <div className="flex-1 max-w-3xl">
            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 space-x-8 mb-8">
              <NavLink
                to=""
                end
                className={({ isActive }) =>
                  isActive
                    ? "pb-3 text-sm font-medium border-b-2 border-black text-black"
                    : "pb-3 text-sm text-gray-500 hover:text-black transition"
                }
              >
                Stories
              </NavLink>

              {/* saved blog tab */}
              {savedBlogs?.length > 0 &&
                (userData._id === userId || userData?.showSavedBlogs) && (
                  <NavLink
                    to={`/${username}/saved-blogs`}
                    className={({ isActive }) =>
                      isActive
                        ? "pb-3 text-sm font-medium border-b-2 border-black text-black"
                        : "pb-3 text-sm text-gray-500 hover:text-black transition"
                    }
                  >
                    Saved Blogs
                  </NavLink>
                )}

              {/* liked blog tab */}
              {likedBlogs?.length > 0 &&
                (userData._id === userId || userData?.showLikedBlogs) && (
                  <NavLink
                    to={`/${username}/liked-blogs`}
                    className={({ isActive }) =>
                      isActive
                        ? "pb-3 text-sm font-medium border-b-2 border-black text-black"
                        : "pb-3 text-sm text-gray-500 hover:text-black transition"
                    }
                  >
                    Liked Blogs
                  </NavLink>
                )}

              {/* draft blog tab */}
              {userData._id === userId && (
                <NavLink
                  to={`/${username}/draft-blogs`}
                  className={({ isActive }) =>
                    isActive
                      ? "pb-3 text-sm font-medium border-b-2 border-black text-black"
                      : "pb-3 text-sm text-gray-500 hover:text-black transition"
                  }
                >
                  Draft Blogs
                </NavLink>
              )}

              {/* about tab */}
              <NavLink
                to="about"
                className={({ isActive }) =>
                  isActive
                    ? "pb-3 text-sm font-medium border-b-2 border-black text-black"
                    : "pb-3 text-sm text-gray-500 hover:text-black transition"
                }
              >
                About
              </NavLink>
            </div>

            {/* Outlet */}
            <UserContext.Provider value={userData}>
              <Outlet />
            </UserContext.Provider>
          </div>

          {/* Right Column - Desktop Sidebar */}
          <aside className="w-80 sticky top-6 self-start">
            <div className="bg-gray-50 rounded-xl p-6 relative">
              {/* Settings/Options Button for Desktop - Top Right */}
              {userData?._id === userId && (
                <div className="absolute top-4 right-4">
                  <div className="relative">
                    <button
                      onClick={() => setShowDeleteDropdown(!showDeleteDropdown)}
                      className="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <i className="fi fi-rr-menu-dots text-gray-600 text-sm cursor-pointer"></i>
                    </button>

                    {/* Dropdown Menu */}
                    {showDeleteDropdown && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                        <Link
                          to="/edit-profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowDeleteDropdown(false)}
                        >
                          <i className="fi fi-rr-edit mr-3 text-gray-500"></i>
                          Edit Profile
                        </Link>
                        <div className="border-t border-gray-100 my-1"></div>
                        <DeleteConfirmation
                          type="user"
                          item={userData}
                          setShowDeleteDropdown={setShowDeleteDropdown}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <img
                  src={
                    userData?.profilePic
                      ? userData?.profilePic
                      : `https://api.dicebear.com/9.x/initials/svg?seed=${userData?.name}`
                  }
                  alt="avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-lg mx-auto mb-4"
                />
                <h1 className="text-xl font-bold mb-1">{userData?.name}</h1>
                <p className="text-sm text-gray-500 mb-3">
                  {userData?.followers?.length} followers
                </p>

                {userData?.bio ? (
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {userData.bio}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 italic mb-4">
                    You can edit your profile to add your bio.
                  </p>
                )}

                {/* Follow / Edit Button */}
                {userData?._id === userId ? (
                  <Link
                    to="/edit-profile"
                    className="block bg-black text-white px-6 py-2.5 rounded-full hover:bg-gray-800 transition text-sm font-medium"
                    onClick={() => setShowDeleteDropdown(false)}
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
                    className="w-full bg-black text-white px-6 py-2.5 rounded-full hover:bg-gray-800 transition text-sm font-medium cursor-pointer"
                  >
                    {isFollowCreator ? "Following" : "Follow"}
                  </button>
                )}
              </div>

              {/* Following List */}
              {userData?.following?.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">Following</h2>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {userData.following.map((f) => (
                      <div
                        key={f._id}
                        className="flex items-center justify-between hover:bg-white p-3 rounded-lg transition group"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              f?.profilePic
                                ? f?.profilePic
                                : `https://api.dicebear.com/9.x/initials/svg?seed=${f?.name}`
                            }
                            alt="avatar"
                            className="w-8 h-8 rounded-full object-cover border"
                          />
                          <Link to={`/@${f.username}`}>
                            <span className="text-sm font-medium text-gray-800 hover:text-black transition">
                              {f.name}
                            </span>
                          </Link>
                        </div>
                        <i className="fi fi-rr-menu-dots text-gray-400 text-sm opacity-0 group-hover:opacity-100 transition cursor-pointer"></i>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Mobile Navigation and Content */}
        <div className="lg:hidden">
          {/* Navigation Tabs - Improved spacing and design */}
          <div className="bg-white sticky top-0 z-10 border-b border-gray-100 mb-6">
            <div className="flex space-x-6 overflow-x-auto px-1 py-3">
              <NavLink
                to=""
                end
                className={({ isActive }) =>
                  isActive
                    ? "pb-2 px-1 text-base font-semibold border-b-2 border-black text-black whitespace-nowrap"
                    : "pb-2 px-1 text-base text-gray-500 hover:text-black whitespace-nowrap transition"
                }
              >
                Stories
              </NavLink>

              {/* saved blog tab */}
              {savedBlogs?.length > 0 &&
                (userData._id === userId || userData?.showSavedBlogs) && (
                  <NavLink
                    to={`/${username}/saved-blogs`}
                    className={({ isActive }) =>
                      isActive
                        ? "pb-2 px-1 text-base font-semibold border-b-2 border-black text-black whitespace-nowrap"
                        : "pb-2 px-1 text-base text-gray-500 hover:text-black whitespace-nowrap transition"
                    }
                  >
                    Saved
                  </NavLink>
                )}

              {/* liked blog tab */}
              {likedBlogs?.length > 0 &&
                (userData._id === userId || userData?.showLikedBlogs) && (
                  <NavLink
                    to={`/${username}/liked-blogs`}
                    className={({ isActive }) =>
                      isActive
                        ? "pb-2 px-1 text-base font-semibold border-b-2 border-black text-black whitespace-nowrap"
                        : "pb-2 px-1 text-base text-gray-500 hover:text-black whitespace-nowrap transition"
                    }
                  >
                    Liked
                  </NavLink>
                )}

              {/* draft blog tab */}
              {(userData._id === userId || userData?.showDraftBlogs) && (
                <NavLink
                  to={`/${username}/draft-blogs`}
                  className={({ isActive }) =>
                    isActive
                      ? "pb-2 px-1 text-base font-semibold border-b-2 border-black text-black whitespace-nowrap"
                      : "pb-2 px-1 text-base text-gray-500 hover:text-black whitespace-nowrap transition"
                  }
                >
                  Drafts
                </NavLink>
              )}

              {/* about tab */}
              {bio && (
                <NavLink
                  to="about"
                  className={({ isActive }) =>
                    isActive
                      ? "pb-2 px-1 text-base font-semibold border-b-2 border-black text-black whitespace-nowrap"
                      : "pb-2 px-1 text-base text-gray-500 hover:text-black whitespace-nowrap transition"
                  }
                >
                  About
                </NavLink>
              )}
            </div>
          </div>

          {/* Outlet - Content area with better spacing */}
          <div className="px-1">
            <UserContext.Provider value={userData}>
              <Outlet />
            </UserContext.Provider>
          </div>

          {/* Mobile: Following List - Cleaner design */}
          {userData?.following?.length > 0 && (
            <div className="mt-10 pt-8 border-t border-gray-100">
              <h2 className="text-xl font-bold mb-6 text-gray-900">
                Following
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {userData.following.slice(0, 6).map((f) => (
                  <Link
                    key={f._id}
                    to={`/@${f.username}`}
                    className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 p-4 rounded-xl transition-all duration-200 hover:shadow-md"
                  >
                    <img
                      src={
                        f.profilePic
                          ? f.profilePic
                          : `https://api.dicebear.com/9.x/initials/svg?seed=${f?.name}`
                      }
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <span className="text-sm font-medium text-gray-800 truncate flex-1">
                      {f.name}
                    </span>
                  </Link>
                ))}
              </div>
              {userData?.following?.length > 6 && (
                <div className="mt-4 text-center">
                  <span className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
                    +{userData?.following?.length - 6} more following
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
