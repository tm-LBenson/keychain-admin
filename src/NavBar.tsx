import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  return (
    <div className="relative">
      <div className="flex bg-pink-500 shadow-lg  w-full top-0 py-4 px-4 sm:px-10  font-[sans-serif] min-h-[70px] tracking-wide  z-50">
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
        </div>
      </div>
    </div>
  );
};

export default Navbar;
