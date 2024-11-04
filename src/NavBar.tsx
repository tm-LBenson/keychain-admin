import React from "react";
import { Link } from "react-router-dom";
import { signInWithGoogle, logout } from "./firestore"; // Adjust the path if necessary
import { useAuth } from "./AuthContext"; // Adjust the path if necessary

const Navbar: React.FC = () => {
  const { currentUser } = useAuth();

  const handleAuthAction = () => {
    if (currentUser) {
      logout();
      window.location.reload();
    } else {
      signInWithGoogle();
    }
  };

  return (
    <div className="relative">
      <div className="flex bg-pink-500 shadow-lg w-full top-0 py-4 px-4 sm:px-10 font-[sans-serif] min-h-[70px] tracking-wide z-50">
        <div className="flex flex-wrap items-center justify-between gap-4 w-full">
          <Link to="/">
            <span className="font-bold ml-16 text-black pl-3 text-lg hidden lg:block">
              KeyChains By Bogy Admin
            </span>
          </Link>

          <button className="lg:hidden flex items-center mr-5 px-3 py-2">
            <svg
              className="w-6 h-6 fill-current text-black"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
            </svg>
          </button>

          <button
            onClick={handleAuthAction}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition duration-150"
          >
            {currentUser ? "Sign out" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
