import { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/shadcn-components/ui/button";
import { Input } from "@/shadcn-components/ui/input";
import { Textarea } from "@/shadcn-components/ui/textarea";
import { Label } from "@/shadcn-components/ui/label";
import toast from "react-hot-toast";
import axios from "axios";
import { updateUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const {
    name,
    token,
    id: userId,
    email,
    followers,
    following,
    username,
    bio,
    profilePic,
  } = useSelector((state) => state.user);

  const [userData, setUserData] = useState({
    name,
    username,
    bio,
    profilePic,
  });

  // Character limits
  const LIMITS = {
    name: 50,
    username: 30,
    bio: 160,
  };

  const [inputNumChar, setInputNumChar] = useState({
    name: name ? name.length : 0,
    username: username ? username.length : 0,
    bio: bio ? bio.length : 0,
  });

  // Username availability states
  const [usernameStatus, setUsernameStatus] = useState({
    isChecking: false,
    isAvailable: null,
    message: "",
    hasChecked: false,
  });

  const fileInputRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isUpdateRemoveButtonDisabled, setIsUpdateRemoveButtonDisabled] =
    useState(false);

  // Debounced username check
  const debounceTimer = useRef(null);

  const controllerRef = useRef(null);

  const checkUsernameAvailability = useCallback(
    async (usernameToCheck) => {
      if (!usernameToCheck || usernameToCheck === username) {
        setUsernameStatus({
          isChecking: false,
          isAvailable: true,
          message: "",
          hasChecked: false,
        });
        return;
      }

      if (usernameToCheck.length < 3) {
        setUsernameStatus({
          isChecking: false,
          isAvailable: false,
          message: "Username must be at least 3 characters long",
          hasChecked: true,
        });
        return;
      }

      // Username valid - Set it
      setUsernameStatus((prev) => ({
        ...prev,
        isChecking: true,
      }));

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/users/check-username/${usernameToCheck}?currentUserId=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUsernameStatus({
          isChecking: false,
          isAvailable: response.data.available,
          message: response.data.message,
          hasChecked: true,
        });
      } catch (error) {
        setUsernameStatus({
          isChecking: false,
          isAvailable: false,
          message: error.response?.data?.message || "Error checking username",
          hasChecked: true,
        });
      }
    },
    [username, userId, token]
  );

  // Cleanup function for abort controller
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  // Debounced username check effect
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (userData.username !== username) {
      debounceTimer.current = setTimeout(() => {
        checkUsernameAvailability(userData.username);
      }, 500);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [userData.username, checkUsernameAvailability, username]);

  // Check if any field exceeds limit
  const hasExceededLimit = () => {
    return Object.keys(LIMITS).some(
      (field) => inputNumChar[field] > LIMITS[field]
    );
  };

  // Check if username is invalid
  const isUsernameInvalid = () => {
    return usernameStatus.hasChecked && !usernameStatus.isAvailable;
  };

  const handleInputChange = (e) => {
    setIsButtonDisabled(false);
    const { name, value, files } = e.target;

    if (files) {
      setUserData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      // Update userData
      setUserData((prev) => ({ ...prev, [name]: value }));

      // Update character count
      setInputNumChar((prev) => ({ ...prev, [name]: value.length }));

      // Reset username status when typing
      if (name === "username") {
        setUsernameStatus((prev) => ({
          ...prev,
          hasChecked: false,
          isAvailable: null,
          message: "",
        }));
      }
    }
  };

  const handleCancel = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null; // cleanup
    }
    navigate(-1);
  };

  const handleUpdateProfile = async () => {
    if (!userData.name || !userData.username) {
      toast.error("Name and username are required");
      return;
    }

    // Check if any field exceeds limit
    if (hasExceededLimit()) {
      toast.error("Some fields exceed character limit");
      return;
    }

    // Check username availability
    if (isUsernameInvalid()) {
      toast.error("Please choose a different username");
      return;
    }

    setIsButtonDisabled(true);
    setIsUpdateRemoveButtonDisabled(true);
    const formData = new FormData();

    for (let key in userData) {
      let value = userData[key];
      if (value === null || value === "null") {
        formData.append(key, null);
      } else {
        formData.append(key, value);
      }
    }

    try {
      controllerRef.current = new AbortController();

      const res = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/users/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          signal: controllerRef.current.signal,
        }
      );

      if (res.status === 200) {
        toast.success(res.data.message);
        dispatch(
          updateUser({
            ...res.data.user,
            id: userId,
            email,
            followers,
            following,
            token,
          })
        );
        navigate(`/@${res.data.user.username}`);
      }
    } catch (err) {
      if (err.name === "CanceledError") {
        toast.error("Update request cancelled");
      } else {
        toast.error(err.response?.data?.message || "Error updating user");
      }
    } finally {
      setIsButtonDisabled(false);
      setIsUpdateRemoveButtonDisabled(false);
    }
  };

  // Get username input styling
  const getUsernameInputStyling = () => {
    if (usernameStatus.isChecking) return "border-yellow-400";
    if (usernameStatus.hasChecked) {
      return usernameStatus.isAvailable ? "border-green-500" : "border-red-500";
    }
    return inputNumChar.username > LIMITS.username ? "border-red-500" : "";
  };

  // Get username status icon
  const getUsernameStatusIcon = () => {
    if (usernameStatus.isChecking) {
      return (
        <div className="animate-spin h-4 w-4 border-2 border-yellow-500 border-t-transparent rounded-full"></div>
      );
    }
    if (usernameStatus.hasChecked) {
      return usernameStatus.isAvailable ? (
        <span className="text-green-500">✓</span>
      ) : (
        <span className="text-red-500">✗</span>
      );
    }
    return null;
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 space-y-6">
      {/* Profile Pic Section */}
      <div className="flex flex-col items-center space-y-2">
        <div className="relative w-30 h-30 bg-gray-100 border border-gray-300 rounded-full overflow-hidden">
          <label
            htmlFor="profilePic"
            className="flex items-center justify-center w-full h-full cursor-pointer"
          >
            {userData.profilePic ? (
              <img
                alt="Profile Preview"
                className="w-full h-full object-cover"
                src={
                  typeof userData.profilePic === "string"
                    ? userData.profilePic
                    : URL.createObjectURL(userData.profilePic)
                }
              />
            ) : (
              <span className="text-gray-500 text-xs text-center">
                Select image
              </span>
            )}
          </label>
          <input
            id="profilePic"
            accept=".png, .jpg, .jpeg"
            type="file"
            name="profilePic"
            onChange={handleInputChange}
            className="hidden"
            ref={fileInputRef}
          />
        </div>

        <div className="flex space-x-4">
          <Button
            disabled={isUpdateRemoveButtonDisabled}
            className={
              isUpdateRemoveButtonDisabled
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }
            onClick={() => fileInputRef.current.click()}
            variant="outline"
            size="sm"
          >
            Update
          </Button>
          <Button
            disabled={isUpdateRemoveButtonDisabled}
            className={
              isUpdateRemoveButtonDisabled
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }
            onClick={() => {
              setIsButtonDisabled(false);
              setUserData((prev) => ({ ...prev, profilePic: null }));
            }}
            variant="destructive"
            size="sm"
          >
            Remove
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Recommended: Square JPG, PNG, or GIF, at least 1,000px per side.
        </p>
      </div>

      {/* Name Input */}
      <div className="space-y-2">
        <Label htmlFor="name">Name*</Label>
        <Input
          onChange={handleInputChange}
          value={userData.name}
          id="name"
          name="name"
          placeholder="Your name"
          className={inputNumChar.name > LIMITS.name ? "border-red-500" : ""}
        />
        <div className="flex justify-between items-center">
          <p
            className={`text-xs ${inputNumChar.name > LIMITS.name ? "text-red-500" : "text-gray-500"}`}
          >
            {inputNumChar.name > LIMITS.name ? "Name is too long!" : ""}
          </p>
          <p
            className={`text-xs text-right ${inputNumChar.name > LIMITS.name ? "text-red-500" : "text-gray-500"}`}
          >
            {inputNumChar.name}/{LIMITS.name}
          </p>
        </div>
      </div>

      {/* Username Input */}
      <div className="space-y-2">
        <Label htmlFor="username">Username*</Label>
        <div className="relative">
          <Input
            onChange={handleInputChange}
            value={userData.username}
            id="username"
            name="username"
            placeholder="Add..."
            className={getUsernameInputStyling()}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {getUsernameStatusIcon()}
          </div>
        </div>

        {/* Username Status Messages */}
        {usernameStatus.isChecking && (
          <p className="text-xs text-yellow-600">Checking availability...</p>
        )}

        {usernameStatus.hasChecked && (
          <p
            className={`text-xs ${usernameStatus.isAvailable ? "text-green-600" : "text-red-500"}`}
          >
            {usernameStatus.message}
          </p>
        )}

        <div className="flex justify-between items-center">
          <p
            className={`text-xs ${inputNumChar.username > LIMITS.username ? "text-red-500" : "text-gray-500"}`}
          >
            {inputNumChar.username > LIMITS.username
              ? "Username is too long!"
              : ""}
          </p>
          <p
            className={`text-xs text-right ${inputNumChar.username > LIMITS.username ? "text-red-500" : "text-gray-500"}`}
          >
            {inputNumChar.username}/{LIMITS.username}
          </p>
        </div>
      </div>

      {/* Bio Input */}
      <div className="space-y-2">
        <Label htmlFor="bio">Short bio</Label>
        <Textarea
          onChange={handleInputChange}
          value={userData.bio}
          id="bio"
          name="bio"
          placeholder="Write a short bio..."
          rows={3}
          className={inputNumChar.bio > LIMITS.bio ? "border-red-500" : ""}
        />
        <div className="flex justify-between items-center">
          <p
            className={`text-xs ${inputNumChar.bio > LIMITS.bio ? "text-red-500" : "text-gray-500"}`}
          >
            {inputNumChar.bio > LIMITS.bio ? "Bio is too long!" : ""}
          </p>
          <p
            className={`text-xs text-right ${inputNumChar.bio > LIMITS.bio ? "text-red-500" : "text-gray-500"}`}
          >
            {inputNumChar.bio}/{LIMITS.bio}
          </p>
        </div>
      </div>

      {/* Info Text */}
      <div className="border-t pt-4 text-sm text-gray-600">
        Go beyond the short bio—add photos and details to make your profile
        truly yours.
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-2">
        <Button
          className="cursor-pointer"
          onClick={handleCancel}
          variant="outline"
        >
          Cancel
        </Button>
        <Button
          disabled={
            isButtonDisabled || hasExceededLimit() || isUsernameInvalid()
          }
          onClick={handleUpdateProfile}
          className={
            isButtonDisabled || hasExceededLimit() || isUsernameInvalid()
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer"
          }
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default EditProfile;
