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
    const [userData, setUserData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    async function handleAuthForm(e) {
        try {
            e.preventDefault();
            const res = await axios.post(`http://localhost:3000/api/v1/${type}`, userData);
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
            const errorMessage = err?.response?.data?.message || "Something went wrong. Please try again.";
            toast.error(errorMessage);
            console.error("Error submitting user data:", err);
        }finally{
            setUserData(() => ({
                name: "",
                email: "",
                password: ""
            }))
        }
    }

    function handleInput(e) {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
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
                        className={`fi ${showPassword ? "fi-rr-eye-crossed" : "fi-rr-eye"}  absolute right-3 top-8 text-muted-foreground opacity-50 cursor-pointer`}
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

                    <Button type="submit" className="w-full">
                        {type === "signup" ? "Register" : "Sign In"}
                    </Button>

                    <div className="text-sm text-center">
                        {type === "signin" ? (
                            <p>Don't have an account? <Link to="/signup" className="underline">Sign up</Link></p>
                        ) : (
                            <p>Already have an account? <Link to="/signin" className="underline">Sign in</Link></p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AuthForm;
