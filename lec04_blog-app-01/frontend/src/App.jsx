import { Routes, Route, useLocation } from 'react-router-dom';
import AuthForm from './pages/authForm';
import Navbar from './react-components/Navbar';
import HomePage from './react-components/HomePage';
import AddBlog from './react-components/AddBlog';
import BlogPage from './pages/BlogPage';

function App() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar stays at the top */}
      {location.pathname !== "/add-blog" && <Navbar />}
      
      {/* Main content will take the remaining space */}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage key={Date.now()} />} /> 
          <Route path="/add-blog" element={<AddBlog />} />
          <Route path="/edit/:id" element={<AddBlog />} />
          <Route path="/signup" element={<AuthForm type={"signup"} />} />
          <Route path="/signin" element={<AuthForm type={"signin"} />} />
          <Route path="/blog/:id" element={<BlogPage />}  />
        </Routes>
      </div>
    </div>
  );
}

export default App;
