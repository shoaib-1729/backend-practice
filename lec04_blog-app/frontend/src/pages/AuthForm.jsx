import { useState, useEffect } from "react";
import { Button } from "@/shadcn-components/ui/button";
import { Input } from "@/shadcn-components/ui/input";
import { Label } from "@/shadcn-components/ui/label";
import { login } from "../utils/userSlice";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
<<<<<<< HEAD
import { googleAuth } from "../utils/firebase.js";
=======
import {googleAuth } from "../utils/firebase.js"
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
import googleIcon from "../assets/google-icon-logo-svgrepo-com.svg";

const AuthForm = ({ type }) => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    setUserData(() => ({
      name: "",
      email: "",
      password: "",
    }));
  }, [type]);

<<<<<<< HEAD
  //   handle gogole auth
  async function handleGoogleAuth() {
    try {
      const userData = await googleAuth();

      if (!userData) {
        return;
      }

      const idToken = await userData.getIdToken();

      // yeh data backend ko bhejna hoga
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/google-auth`,
        {
          accessToken: idToken,
        }
      );

      dispatch(login(res.data.user));

      if (res.status === 200) {
        toast.success(res.data.message || "Registration successful");
      }

      navigate("/");
    } catch (err) {
      const errorMessage =
=======
//   handle gogole auth
async function handleGoogleAuth(){
    try{
        const userData = await googleAuth()

        if(!userData){
          return
        }

        const idToken = await userData.getIdToken();


        // yeh data backend ko bhejna hoga
        const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/google-auth`, {
          accessToken: idToken
        })

        dispatch(login(res.data.user));

        if (res.status === 200) {
        toast.success(res.data.message || "Registration successful");
         }

        navigate("/");
     
    }catch(err){
         const errorMessage =
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
        err?.response?.data?.message ||
        "Something went wrong. Please try again.";
      toast.error(errorMessage);
    }
<<<<<<< HEAD
  }
=======

}
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed

  async function handleAuthForm(e) {
    try {
      e.preventDefault();
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/${type}`,
        userData
      );
      dispatch(login(res.data.user));
      if (res.status === 200) {
        toast.success(res.data.message || "Login successful");
      }
      if (type === "signin") {
        navigate("/");
      } else if (type === "signup") {
        navigate("/signin");
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        "Something went wrong. Please try again.";
      toast.error(errorMessage);
    } finally {
      setUserData(() => ({
        name: "",
        email: "",
        password: "",
      }));
    }
  }

  function handleInput(e) {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-6">
        <h1 className="mb-6 text-2xl font-semibold">
          {type === "signup" ? "Sign Up" : "Sign In"}
        </h1>

        <form onSubmit={handleAuthForm} className="space-y-4">
          {type === "signup" && (
            <div className="space-y-2 relative">
              <Label htmlFor="name">Name</Label>
              <i className="fi fi-rr-file-user absolute left-3 top-8 text-muted-foreground opacity-50"></i>
              <Input
                onChange={handleInput}
                id="name"
                name="name"
                value={userData.name}
                placeholder="Enter your name"
                required
                className="pl-10"
              />
            </div>
          )}

          <div className="space-y-2 relative">
            <Label htmlFor="email">Email</Label>
            <i className="fi fi-rr-envelope absolute left-3 top-8 text-muted-foreground opacity-50"></i>
            <Input
              onChange={handleInput}
              id="email"
              name="email"
              value={userData.email}
              type="email"
              placeholder="Enter your email address"
              required
              className="pl-10"
            />
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="password">Password</Label>
            <i className="fi fi-rr-lock absolute left-3 top-8 text-muted-foreground opacity-50"></i>
            <i
              onClick={() => setShowPassword((prev) => !prev)}
              className={`fi ${
                showPassword ? "fi-rr-eye-crossed" : "fi-rr-eye"
              }  absolute right-3 top-8 text-muted-foreground opacity-50 cursor-pointer`}
            ></i>
            <Input
              onChange={handleInput}
              id="password"
              name="password"
              value={userData.password}
              type={`${showPassword ? "text" : "password"}`}
              placeholder="Create a password"
              required
              className="pl-10 pr-10"
            />
          </div>

<<<<<<< HEAD
          <Button type="submit" className="w-full cursor-pointer">
=======
          <Button type="submit" className="w-full">
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
            {type === "signup" ? "Register" : "Sign In"}
          </Button>

          {/* google auth wali cheez yah aayegi */}
          {/* or separator */}
          <div className="flex items-center gap-2 my-3">
            <div className="h-px flex-1 bg-gray-300" />
            <span className="text-gray-500 text-sm">or</span>
            <div className="h-px flex-1 bg-gray-300" />
          </div>

          {/* Google Auth Button */}
<<<<<<< HEAD
          <button
            type="button"
            onClick={handleGoogleAuth}
            className="flex items-center justify-center gap-3 px-5 py-2.5 w-full border border-gray-300 rounded-md bg-white text-gray-700 text-base font-medium transition-all duration-200 ease-in-out hover:bg-gray-100 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <img src={googleIcon} alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>
=======
         <button
  type="button"
  onClick={handleGoogleAuth}
  className="flex items-center justify-center gap-3 px-5 py-2.5 w-full border border-gray-300 rounded-md bg-white text-gray-700 text-base font-medium transition-all duration-200 ease-in-out hover:bg-gray-100 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
>
  <img src={googleIcon} alt="Google" className="w-5 h-5" />
  Continue with Google
</button>

>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed

          <div className="text-sm text-center">
            {type === "signin" ? (
              <p>
                Don't have an account?{" "}
                <Link to="/signup" className="underline">
                  Sign up
                </Link>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <Link to="/signin" className="underline">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
