import { useState, useRef } from "react";
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
  const { name, token, id: userId, email, followers, following, username, bio, profilePic } =
    useSelector((state) => state.user);

  const [userData, setUserData] = useState({
    name,
    username,
    bio,
    profilePic,
  });

  const fileInputRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const handleInputChange = (e) => {
    setIsButtonDisabled(false);
    const { name, value, files } = e.target;

    if (files) {
      setUserData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setUserData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdateProfile = async () => {
    // if (!userData.name || !userData.username) {
    //   toast.error("Name and username are required");
    //   return;
    // }

    setIsButtonDisabled(true);
    const formData = new FormData();

    for (let key in userData) {
      let value = userData[key];
      if (value === null || value === "null") {
        formData.append(key, null);
      } else {
        formData.append(key, value);
      }
    }

// formData.append("name", userData.name);
// formData.append("username", userData.username);
// formData.append("bio", userData.bio);

// If profilePic is being removed
if (userData.profilePic === null || userData.profilePic === "null") {
  formData.append("removeProfilePic", true); // ✅ send a signal to remove
} else {
  formData.append("profilePic", userData.profilePic);
}

    

    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/users/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 200) {
        toast.success(res.data.message);
        dispatch(updateUser({ ...res.data.user, id: userId, email, followers, following, token }));
        navigate(`/@${res.data.user.username}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating user");
    }
  };

// const handleUpdateProfile = async () => {
//   // if (!userData.name || !userData.username) {
//   //   toast.error("Name and username are required");
//   //   return;
//   // }

//   setIsButtonDisabled(true);
//   const formData = new FormData();

//   // Append required fields
//   formData.append("name", userData.name);
//   formData.append("username", userData.username);
//   formData.append("bio", userData.bio || "");

//   // Case 1: If user wants to remove the profile picture
//   if (userData.profilePic === null) {
//     formData.append("profilePic", "null"); // 👈 backend expects "null" string
//   }

//   // Case 2: If user selected a new image (File object)
//   else if (userData.profilePic instanceof File) {
//     formData.append("profilePic", userData.profilePic);
//   }

//   try {
//     const res = await axios.patch(
//       `${import.meta.env.VITE_BASE_URL}/users/${userId}`,
//       formData,
//       {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     if (res.status === 200) {
//       toast.success(res.data.message);

//       // Update Redux store with fresh user data
//       dispatch(updateUser({
//         ...res.data.user,
//         id: userId,
//         email,
//         followers,
//         following,
//         token,
//       }));

//       navigate(`/@${res.data.user.username}`);
//     }
//   } catch (err) {
//     toast.error(err.response?.data?.message || "Error updating user");
//   }
// };

// const handleRemoveProfilePic = async () => {
//   const formData = new FormData();

//   formData.append("profilePic", "null"); // signal to remove
//   formData.append("name", userData.name);
//   formData.append("username", userData.username);
//   formData.append("bio", userData.bio); // optional

//   try {
//     const res = await axios.patch(
//       `${import.meta.env.VITE_BASE_URL}/users/${userId}`,
//       formData,
//       {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     if (res.status === 200) {
//       setIsButtonDisabled(false)
//       toast.success("Profile picture removed");
//       dispatch(updateUser({ ...res.data.user, id: userId, email, followers, following, token }));
//       setUserData((prev) => ({ ...prev, profilePic: null }));
//     }
//   } catch (err) {
//     toast.error("Failed to remove profile picture");
//   }
// };



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
              <span className="text-gray-500 text-xs text-center">Select image</span>
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
          <Button onClick={() => fileInputRef.current.click()} variant="outline" size="sm">
            Update
          </Button>
          <Button
            className="cursor-pointer"
            onClick={() => {
              setIsButtonDisabled(false);
              setUserData((prev) => ({ ...prev, profilePic: null }));
      //         dispatch(updateUser({
      //   ...res.data.user,
      //   id: userId,
      //   email,
      //   followers,
      //   following,
      //   token,
      // }));
      // dispatch(updateUser(userData))
            }}
            variant="destructive"
            size="sm"
          >
            Remove
          </Button>
          {/* <Button
  className="cursor-pointer"
  onClick={handleRemoveProfilePic}
  variant="destructive"
  size="sm"
>
  Remove
</Button> */}
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
        />
        <p className="text-xs text-gray-500 text-right">0/50</p>
      </div>

      {/* Username Input */}
      <div className="space-y-2">
        <Label htmlFor="username">Username*</Label>
        <Input
          onChange={handleInputChange}
          value={userData.username}
          id="username"
          name="username"
          placeholder="Add..."
        />
        <p className="text-xs text-gray-500 text-right">0/4</p>
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
        />
        <p className="text-xs text-gray-500 text-right">0/160</p>
      </div>

      {/* Info Text */}
      <div className="border-t pt-4 text-sm text-gray-600">
        Personalize with images and more to paint more of a vivid portrait of yourself than your ‘Short bio.’
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-2">
        <Button onClick={() => navigate(-1)} variant="outline">
          Cancel
        </Button>
        <Button
          disabled={isButtonDisabled}
          onClick={handleUpdateProfile}
          className={isButtonDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default EditProfile;
