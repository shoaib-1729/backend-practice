import { Link } from "react-router-dom";
import logo from "../../public/logo.svg"

const Navbar = () => {
    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-5xl mx-auto px-4 h-[72px] flex items-center justify-between">
                {/* Left: Logo + Search */}
                <div className="flex items-center space-x-6">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                       <img src={logo} alt="blog-logo" />
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

                {/* Right: Links */}
                <div className="flex items-center space-x-6 text-gray-700 text-sm font-medium">
                    <Link to="/" className="hover:text-black transition-colors">Home</Link>
                    <Link to="/add-blog" className="hover:text-black transition-colors">
                        <div className="flex items-center space-x-1">
                            <i className="fi fi-ts-file-edit text-base"></i>
                            <span>Write</span>
                        </div>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
