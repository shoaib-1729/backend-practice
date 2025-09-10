import { useNavigate } from "react-router-dom";
import heroIllustration from "../assets/hero-illustration.png";

const HeroPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#F5F4F0] min-h-screen flex flex-col overflow-x-hidden">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-between px-4 sm:px-6 md:px-8 lg:px-16 py-8 sm:py-12 gap-6 lg:gap-12">
        {/* Left Text */}
        <div className="w-full lg:max-w-xl text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight text-gray-900 break-words">
            Convey your heart <br className="hidden sm:block" />
            <span className="sm:hidden">through words.</span>
            <span className="hidden sm:inline">through words.</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-700 max-w-lg mx-auto lg:mx-0">
            A place to redefine your soul by sharing stories with people around
            the globe.
          </p>
          <button
            onClick={() => navigate("/signin")}
            className="mt-6 bg-black text-white px-6 py-3 rounded-full text-base sm:text-lg hover:bg-gray-800 transition-colors duration-200 cursor-pointer font-medium"
          >
            Get Started
          </button>
        </div>

        {/* Right Image */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
          <img
            src={heroIllustration}
            alt="hero-graphic"
            className="max-w-full h-auto object-contain flex-shrink-0"
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-300 py-4 sm:py-6 text-center text-xs sm:text-sm text-gray-600 px-4">
        <p>© {new Date().getFullYear()} BloomVerse — All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HeroPage;
