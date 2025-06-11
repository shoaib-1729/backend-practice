import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import AuthForm from "./pages/authForm";
import Navbar from "./react-components/Navbar";
import HomePage from "./react-components/HomePage";
import AddBlog from "./react-components/AddBlog";
import BlogPage from "./pages/BlogPage";
import ProtectedRoute from "./react-components/ProtectedRoute";
import VerifyUser from "./react-components/VerifyUser";

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar stays at the top */}
      {/* add-blog, signin, signup routes par navbar matt dikhao */}
      {!["/add-blog", "/signin", "/signup"].includes(location.pathname) && (
        <Navbar />
      )}

      {/* Main content will take the remaining space */}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/add-blog"
            element={
              <ProtectedRoute>
                <AddBlog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute>
                <AddBlog />
              </ProtectedRoute>
            }
          />
          <Route path="/signup" element={<AuthForm type={"signup"} />} />
          <Route path="/signin" element={<AuthForm type={"signin"} />} />
          <Route path="/blog/:id" element={<BlogPage />} />
          <Route path="/verify-user/:verificationToken" element={<VerifyUser />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
