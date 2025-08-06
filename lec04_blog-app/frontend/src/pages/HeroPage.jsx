import { useNavigate } from "react-router-dom";
import heroIllustration from "../assets/hero-illustration.png";


const HeroPage = () => {
  const navigate = useNavigate();
// className="bg-[#F5F4F0] min-h-screen flex flex-col">
  return (
    <div className="bg-[#F5F4F0] min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-between px-8 md:px-16 py-12">
        {/* Left Text */}
        <div className="max-w-xl">
          <h1 className="text-5xl md:text-6xl font-serif font-bold leading-tight text-gray-900">
            Convey your heart <br /> through words.
          </h1>
          <p className="mt-4 text-lg text-gray-700">
            A place to redefine your soul by sharing stories with people around the globe.
          </p>
          <button
            onClick={() => navigate("/signin")}
            className="mt-6 bg-black text-white px-6 py-2 rounded-full text-lg hover:bg-gray-800 cursor-pointer"
          >
            Get Started
          </button>
        </div>

        {/* Right Image */}
        <div className="mt-8 md:mt-0">
          <img
            src={heroIllustration}
            alt="hero-graphic"
            className="max-w-md w-full"
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} BloomVerse — All rights reserved.
      </footer>
    </div>
  );
};

export default HeroPage;
