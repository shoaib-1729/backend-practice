import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/shadcn-components/ui/button";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../public/logo.svg";
import { logout } from "../utils/userSlice.js";
import toast from "react-hot-toast";

const Navbar = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();
  const avatarRef = useRef();
  const popupRef = useRef();
  const dispatch = useDispatch();
  const location = useLocation();

  const { token, name, username, profilePic } = useSelector(
    (state) => state.user
  );

  const handleWriteClick = () => {
    if (!token) {
      toast.error("You need to sign in first to carve your story!");
    } else {
      navigate("/add-blog");
    }
  };

  function handleLogout() {
    dispatch(logout());
    setShowPopup(false);
    toast.success("Logged out");
    navigate("/");
  }

  useEffect(() => {
    if (location.pathname === "/") {
      setSearchQuery("");
    }
  }, [location.pathname]);

  useEffect(() => {
    if (avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect();
      setPopupPos({
        top: rect.bottom + 8,
        left: rect.right - 180,
      });
    }
  }, [showPopup]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target)
      ) {
        setShowPopup(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // mobile hamburger menu set false on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="border-b drop-shadow">
      <div className="max-w-[90vw] mx-auto px-4 h-[60px] flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-4">
          <Link to="/">
            <img src={logo} alt="blog-logo" className="h-6 w-auto" />
          </Link>
        </div>

        {/* Middle: Search (hidden on mobile) */}
        {token && (
          <div className="hidden md:block w-64 relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400 border-0 focus:ring-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (searchQuery.trim() && e.code === "Enter") {
                  const encodedQuery = searchQuery.trim().split(" ").join("+");
                  navigate(`/search-query?q=${encodedQuery}`);
                  setSearchQuery("");
                }
              }}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
              <i className="fi fi-rs-search" />
            </div>
          </div>
        )}

        {/* Right: Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={handleWriteClick}
            className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            <i className="fi fi-ts-file-edit text-base" /> Write
          </button>

          {token && (
            <div
              ref={avatarRef}
              onClick={() => setShowPopup((prev) => !prev)}
              className="relative w-10 h-10 group cursor-pointer"
            >
              <img
                src={
                  profilePic
                    ? profilePic
                    : `https://api.dicebear.com/9.x/initials/svg?seed=${name}`
                }
                alt="avatar"
                className="w-full h-full rounded-full object-cover border border-gray-300 dark:border-gray-600 shadow-sm"
              />

              {/* overlay div */}
              <div className="absolute inset-0 bg-gray-300/15 group-hover:bg-gray-400/20 dark:bg-gray-700/20 dark:group-hover:bg-gray-600/30 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200" />
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button
            className="cursor-pointer"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <i className="fi fi-rr-menu-burger text-2xl text-gray-700 dark:text-white"></i>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {token && menuOpen && (
        <div className="md:hidden bg-white dark:bg-black border-t dark:border-gray-700 px-4 pb-4 space-y-2">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-500 dark:placeholder:text-gray-400 border-0 focus:ring-0 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (searchQuery.trim() && e.code === "Enter") {
                  setMenuOpen((prev) => !prev);
                  const encodedQuery = searchQuery.trim().split(" ").join("+");
                  navigate(`/search-query?q=${encodedQuery}`);
                }
              }}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
              <i className="fi fi-rs-search" />
            </div>
          </div>

          <Link
            to="/add-blog"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
          >
            <i className="fi fi-ts-file-edit text-base" /> Write
          </Link>

          {token ? (
            <div className="space-y-2">
              <Link
                to={`/@${username}`}
                className="block text-sm text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
              >
                <i className="fi fi-ts-circle-user"></i> Profile
              </Link>
              <Link
                to="/edit-profile"
                className="block text-sm text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
              >
                <i className="fi fi-ts-user-pen"></i> Edit Profile
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:text-red-600 cursor-pointer"
              >
                <i className="fi fi-ts-sign-out-alt"></i> Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link to="/signin">
                <Button
                  variant="outline"
                  className="w-full text-sm rounded-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="w-full text-sm rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* User Popup (Desktop only) */}
      {showPopup &&
        createPortal(
          <div
            ref={popupRef}
            className="w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-[9999]"
            style={{
              top: `${popupPos.top}px`,
              left: `${popupPos.left}px`,
              position: "fixed",
            }}
          >
            <ul className="py-2 text-sm text-gray-700 dark:text-gray-300">
              <Link to={`/@${username}`} onClick={() => setShowPopup(false)}>
                <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                  <i className="fi fi-ts-circle-user"></i> Profile
                </li>
              </Link>
              <Link to={"/edit-profile"} onClick={() => setShowPopup(false)}>
                <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                  <i className="fi fi-ts-user-pen"></i> Edit Profile
                </li>
              </Link>

              <Link to={"/user-setting"} onClick={() => setShowPopup(false)}>
                <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                  <i className="fi fi-rr-user-gear"></i> User Setting
                </li>
              </Link>
              <li>
                <p
                  onClick={handleLogout}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 hover:text-red-600 cursor-pointer"
                >
                  <i className="fi fi-ts-sign-out-alt"></i> Logout
                </p>
              </li>
            </ul>
          </div>,
          document.getElementById("portal-root")
        )}
    </nav>
  );
};

export default Navbar;
