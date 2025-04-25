import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";


const ProtectedRoute = ({ children }) => {
    // token
    const { token } = useSelector(state => state.user);


    return token ? children : <Navigate to="/signin" />;
}

export default ProtectedRoute;