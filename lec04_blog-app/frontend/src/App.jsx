import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import AuthForm from "./pages/authForm";
import Navbar from "./react-components/Navbar";
import HomePage from "./pages/HomePage";
import AddBlog from "./react-components/AddBlog";
import BlogPage from "./pages/BlogPage";
import ProtectedRoute from "./react-components/ProtectedRoute";
import VerifyUser from "./react-components/VerifyUser";
import UserProfile from "./react-components/UserProfile";
import EditProfile from "./react-components/EditProfile";
import SearchedBlog from "./react-components/SearchedBlog";
import TagPage from "./pages/TagPage";
import AboutPage from "./pages/AboutPage";
import UserBlogs from "./react-components/UserBlogs";
import UserList from "./react-components/UserList";
import BlogList from "./react-components/BlogList";

function App() {
  console.log(import.meta.env.VITE_BASE_URL);
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
          <Route path="/" element={<HomePage /> } />
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

          <Route
            path="/verify-user/:verificationToken"
            element={<VerifyUser />}
          />
          <Route
            path="/:username"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <ProtectedRoute>
                  <UserBlogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="list"
              element={
                <ProtectedRoute>
                  <UserList />
                </ProtectedRoute>
              }
            />
            <Route
              path="about"
              element={
                <ProtectedRoute>
                  <AboutPage />
                </ProtectedRoute>
              }
            />
          </Route>
          
                      <Route
            path="/:username/bloglist/liked"
            element={
              <ProtectedRoute>
                <BlogList type={"liked"} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:username/bloglist/saved"
            element={
              <ProtectedRoute>
                <BlogList type={"saved"} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search-query"
            element={
              <ProtectedRoute>
                <SearchedBlog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tag/:tagName"
            element={
              <ProtectedRoute>
                <TagPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
