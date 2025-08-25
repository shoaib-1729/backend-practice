import { useState } from "react";
import { Button } from "@/shadcn-components/ui/button";
import axios from "axios";
import toast from "react-hot-toast";
import { Navigate, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useSelector((state) => state.user);

  const navigate = useNavigate();

  async function handleForgetPassword() {
    try {
      setLoading(true);
      const res = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/auth/forget-password`,
        { email }
      );

      if (res.status === 200) {
        toast.success(res.data.message);
        navigate("/signin");
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        "Something went wrong. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return token ? (
    <Navigate to="/" />
  ) : (
    <div className="flex flex-col gap-3 max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-sm">
      <label className="font-semibold text-gray-700" htmlFor="email">
        Enter your email:
      </label>
      <input
        className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        type="email"
        id="email"
        placeholder="example@mail.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Button
        onClick={handleForgetPassword}
        disabled={loading}
        className="w-full mt-4 p-3 cursor-pointer disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send New Password"}
      </Button>
    </div>
  );
};

export default ForgetPassword;
