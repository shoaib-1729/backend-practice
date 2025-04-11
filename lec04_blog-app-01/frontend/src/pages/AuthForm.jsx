import { useState } from "react";
import { Button } from "@/shadcn-components/ui/button";
import { Input } from "@/shadcn-components/ui/input";
import { Label } from "@/shadcn-components/ui/label";
import { login } from "../utils/userSlice";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from "react-router-dom";

const AuthForm = ({ type }) => {
    // state for user data 
    const [userData, setUserData] = useState({
        name: "",
        email: "",
        password: ""
    });

    // navigate hook
    const navigate = useNavigate();

    // use dispatch
    const dispatch = useDispatch();

    // form submit pr backend call -> API: create user
    async function handleAuthForm(e) {
        try {
            // prevent form from refresh
            e.preventDefault();

            // Send data to API
            const res = await axios.post(`http://localhost:3000/api/v1/${type}`, userData);

            console.log("Axios response:", res);

                // store token in redux store
                dispatch(login(res.data.user));

                // Success (status 200)
                if (res.status === 200) {
                    toast.success(res.data.message || "Login successful");
                    console.log(res);
                }

                // Handle redirects based on the type
                if (type === "signin") {
                    navigate("/");  // Redirect to home page after sign-in
                } else if (type === "signup") {
                    navigate("/signin");  // Redirect to sign-in page after sign-up
                }
        } catch (err) {
            // Error (network issue or status 4xx/5xx)
            const errorMessage = err?.response?.data?.message || "Something went wrong. Please try again.";
            toast.error(errorMessage);
            console.error("Error submitting user data:", err);
        }
    }

    // user data post to backend
    async function handleInput(e) {
        const { name, value } = e.target;
        // set user data
        setUserData(prevData => {
            return {
                ...prevData,
                [name]: value
            }
        });
    }

    return (
        <div className="mx-auto max-w-md p-6">
            <h1 className="mb-6 text-2xl font-semibold">{type === "signup" ? "Sign Up" : "Sign In"}</h1>

            <form onSubmit={handleAuthForm} className="space-y-4">
                {type === "signup" && (
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input onChange={handleInput} id="name" name="name" placeholder="Enter your name" required />
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input onChange={handleInput} id="email" name="email" type="email" placeholder="Enter your email address" required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input onChange={handleInput} id="password" name="password" type="password" placeholder="Create a password" required />
                </div>

                <Button type="submit" className="w-full">
                    {type === "signup" ? "Register" : "Sign In"}
                </Button>

                <div>
                    {type === "signin" ? (
                        <p>Don't have an account 5<Link to="/signup">Sign up</Link></p>
                    ) : (
                        <p>Already have an account <Link to="/signin">Sign in</Link></p>
                    )}
                </div>
            </form>
        </div>
    );
}

export default AuthForm;
