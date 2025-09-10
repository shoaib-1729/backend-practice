import axios from "axios";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

const VerifyUser = () => {
  const { verificationToken } = useParams();

  const navigate = useNavigate();

  async function verifyEmail() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/verify-email/${verificationToken}`
      );

      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response.data.message);
    } finally {
      navigate("/signin");
    }
  }

  // call kar dunga function ko
  useEffect(() => verifyEmail(), [verificationToken]);
  return <div>Verify User</div>;
};

export default VerifyUser;
