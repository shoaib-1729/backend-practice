import {useState } from "react";
import {useDispatch, useSelector} from "react-redux";
import { Button } from "@/shadcn-components/ui/button";
import { Input } from "@/shadcn-components/ui/input";
import { Textarea } from "@/shadcn-components/ui/textarea";
import { Label } from "@/shadcn-components/ui/label";
import toast from "react-hot-toast";
import axios from "axios";
import { updateUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

const EditProfile = () => {
    const {name, token, id: userId, email, followers, following, username, bio, profilePic} = useSelector((state) => state.user)

    const dispatch = useDispatch();

    const navigate = useNavigate();

    const [userData, setUserData] = useState({
        name,
        username,
        bio,
        profilePic
    })

    const fileInputRef = useRef();

    const [isButtonDisabled, setIsButtonDisabled] = useState(true);

    async function handleUpdateProfile(){
      // disable kardo button ko
setIsButtonDisabled(true);

      const formData = new FormData();

   for (let key of Object.keys(userData)) {
  let value = userData[key];
  if (value === null || value === "null") {
    formData.append(key, "null");
  } else {
    formData.append(key, value);
  }
}

        try{
             const res =  await axios.patch(`${import.meta.env.VITE_BASE_URL}/users/${userId}`,
               formData, 
                {
                    headers:{
                        "Content-Type":"multipart/form-data",
                        Authorization: `Bearer ${token}`
                    }
                }
            );

                // redirect to home page
                if(res.status == 200){
                    toast.success(res.data.message)
                }
                dispatch(updateUser({...res.data.user, id: userId, email, followers, following, token}))
                // navigate to user profile
                navigate(`/@${res.data.user.username}`)
        }catch(err){
            toast.error(err.response.data.message)
            // console.log("Error updating user", err)
        }

    }
  

    function handleInputChange(e){
      // enable button
      setIsButtonDisabled(false);
        const {name, value, files} = e.target;
        // if image present
        if(files){
            setUserData((prevData) => ({...prevData, [name] : files[0]}))

        }else{
            setUserData((prevData) => ({...prevData, [name] : value}))
        }
    }


    // console.log(userData)

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 space-y-6">
      {/* Photo section */}
      <div className="flex flex-col items-center space-y-2">
        {/* profile pic image */}
         <div>
          <div className="relative w-30 h-30 bg-gray-100 border border-gray-300 rounded-full overflow-hidden">
            <label
              htmlFor="profilePic"
              className="flex items-center justify-center w-full h-full cursor-pointer"
            >
              {userData.profilePic ? (
                <img
                  alt="Cover Preview"
                  className="w-full h-full object-cover"
                  src={
                    typeof userData.profilePic === "string"
                      ? userData.profilePic
                      : URL.createObjectURL(userData.profilePic)
                  }
                />
              ) : (
                <span 
                className="text-gray-500 text-xs text-center"
>
                  Select image
                </span>
              )}
            </label>

            <input
              id="profilePic"
              accept=".png, .jpg, .jpeg"
              type="file"
              name="profilePic"
              placeholder="Select Image"
              onChange={handleInputChange}
              className="hidden"
              ref={fileInputRef}
            />
          </div>
        </div>
        <div className="flex space-x-4">
          <Button 
          onClick={() => fileInputRef.current.click()}
          variant="outline" size="sm">Update</Button>
          <Button 
          onClick={() => {
            setUserData((prevData) => ({...prevData, profilePic:null}))
          }}
          variant="destructive" size="sm">Remove</Button>
        </div>
        <p className="text-xs text-gray-500 text-center">
          Recommended: Square JPG, PNG, or GIF, at least 1,000 pixels per side.
        </p>
      </div>

      {/* Name field */}
      <div className="space-y-2">
        <Label htmlFor="name">Name*</Label>
        <Input 
        onChange={handleInputChange}
        value={userData?.name}
        id="name" name="name" placeholder="Your name" />
        <p className="text-xs text-gray-500 text-right">0/50</p>
      </div>

      {/* Username field */}
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input 
        onChange={handleInputChange}
        value={userData?.username}
        id="username" name="username" placeholder="Add..." />
        <p className="text-xs text-gray-500 text-right">0/4</p>
      </div>

      {/* Short bio field */}
      <div className="space-y-2">
        <Label htmlFor="bio">Short bio</Label>
        <Textarea 
        onChange={handleInputChange}
        value={userData?.bio}
        id="bio" name="bio" placeholder="Write a short bio..." rows={3} />
        <p className="text-xs text-gray-500 text-right">0/160</p>
      </div>

      {/* About Page note */}
      <div className="border-t pt-4 text-sm text-gray-600">
        Personalize with images and more to paint more of a vivid portrait of yourself than your ‘Short bio.’
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-2">
        <Button className="cursor-pointer" variant="outline">Cancel</Button>
        <Button
  disabled={isButtonDisabled}
  onClick={handleUpdateProfile}
  className={isButtonDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
>
  Save
</Button>
      </div>
    </div>
  )}

export default EditProfile;
