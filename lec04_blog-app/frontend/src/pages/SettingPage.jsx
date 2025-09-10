import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";

const SettingPage = () => {
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const {
    token,
    id: userId,
    username,
    showLikedBlogs,
    showSavedBlogs,
    showDraftBlogs,
  } = useSelector((state) => state.user);

  const [settingsData, setSettingsData] = useState({
    showDraft: showDraftBlogs,
    showLiked: showLikedBlogs,
    showSaved: showSavedBlogs,
  });

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const toggleClass = (state) => (state ? "bg-green-500" : "bg-gray-300");

  const knobClass = (state) => (state ? "translate-x-6" : "translate-x-1");

  const handleToggle = (key) => {
    // enable button
    setIsButtonDisabled(false);
    setSettingsData((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Add this function inside your SettingPage component
  const handleResetPassword = () => {
    // Navigate to reset password page
    navigate(`/reset-password/${userId}`);
  };

  async function handleSettings() {
    // Backend call yahan maaro

    // disable button
    setIsButtonDisabled(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/users/${username}/settings`,
        settingsData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      //  redirect to home page
      if (res.status == 200) {
        // enable button
        setIsButtonDisabled(false);
        toast.success(res.data.message);

        //    dispatch
        dispatch(updateUser(res.data.user));
        // navigate -> home page
        navigate(-1);
      }
    } catch (err) {
      toast.error(err.response.data.message);
      // enable button
      setIsButtonDisabled(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-semibold mb-6 border-b pb-2">
        <i class="fi fi-rr-settings mr-2"></i>
        Settings
      </h1>

      <div className="space-y-6">
        {/* Show Draft */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 gap-2 sm:gap-0">
          <div>
            <h2 className="text-base sm:text-lg font-medium">Show Draft</h2>
            <p className="text-sm text-gray-500">
              Display your unpublished draft blogs.
            </p>
          </div>
          <button
            onClick={() => handleToggle("showDraft")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${toggleClass(
              settingsData.showDraft
            )}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${knobClass(
                settingsData.showDraft
              )}`}
            />
          </button>
        </div>

        {/* Show Liked Blogs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 gap-2 sm:gap-0">
          <div>
            <h2 className="text-base sm:text-lg font-medium">
              Show Liked Blogs
            </h2>
            <p className="text-sm text-gray-500">
              Display blogs you have liked on your profile.
            </p>
          </div>
          <button
            onClick={() => handleToggle("showLiked")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${toggleClass(
              settingsData.showLiked
            )}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${knobClass(
                settingsData.showLiked
              )}`}
            />
          </button>
        </div>

        {/* Show Saved Blogs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 gap-2 sm:gap-0">
          <div>
            <h2 className="text-base sm:text-lg font-medium">
              Show Saved Blogs
            </h2>
            <p className="text-sm text-gray-500">
              Display blogs you have saved for later.
            </p>
          </div>
          <button
            onClick={() => handleToggle("showSaved")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${toggleClass(
              settingsData.showSaved
            )}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${knobClass(
                settingsData.showSaved
              )}`}
            />
          </button>
        </div>
      </div>

      {/* Save Changes Button */}
      <div className="mt-8 flex justify-center sm:justify-end">
        <button
          disabled={isButtonDisabled}
          onClick={handleSettings}
          className={`px-6 py-2 text-sm sm:text-base rounded-lg transition ${
            isButtonDisabled
              ? "bg-gray-500 cursor-not-allowed text-white"
              : "bg-black hover:bg-gray-800 cursor-pointer text-white"
          }`}
        >
          Save Changes
        </button>
      </div>

      {/* Reset Password Section */}
      <div className="mt-8 pt-6 border-t">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-medium flex items-center gap-2">
              <i class="fi fi-sr-lock"></i>
              Password & Security
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Change your password to keep your account secure.
            </p>
          </div>
          <button
            onClick={handleResetPassword}
            className="px-6 py-2 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 flex items-center gap-2 justify-center sm:justify-start cursor-pointer"
          >
            Reset Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingPage;
