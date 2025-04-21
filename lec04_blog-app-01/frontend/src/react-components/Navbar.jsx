import { Button } from "@/shadcn-components/ui/button";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import logo from "../../public/logo.svg";

const Navbar = () => {
  const { token, name } = useSelector((state) => state.user);

  return (
    <nav className="border-b drop-shadow-sm">
      <div className="max-w-[90vw] mx-auto px-4 h-[60px] flex items-center justify-between">
        {/* Left: Logo + Searrh */}
        <div className="flex items-center gap-6 ml-0">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={logo} alt="blog-logo" className="h-6 w-auto" />
          </Link>

          {/* Search Bar */}
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 text-sm text-gray-700 focus:outline-none focus:ring-0 placeholder:text-gray-500"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
              <i className="fi fi-rs-search"></i>
            </div>
          </div>
        </div>

        {/* Right: Write Link + Auth */}
        <div className="flex items-center gap-6">
          {/* Write */}
          <Link
            to="/add-blog"
            className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-black transition-colors"
          >
            <i className="fi fi-ts-file-edit text-base"></i>
            <span>Write</span>
          </Link>

          {/* Auth */}
          {token ? (
            <p className="text-sm font-medium text-gray-700">Hi, {name}</p>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/signin">
                <Button
                  variant="outline"
                  className="rounded-full px-5 py-2 text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Sign In
                </Button>
              </Link>

              {/* sign up button */}
              <Link to="/signup">
                <Button className="rounded-full bg-black text-white px-5 py-2 text-sm font-medium hover:bg-gray-800 transition-colors">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
