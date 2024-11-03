import logo from "/logo.webp"; // Ensure the correct path to your logo

const Navbar: React.FC = () => {
  return (
    <div className="relative">
      <div className="flex bg-pink-500 shadow-lg  w-full top-0 py-4 px-4 sm:px-10  font-[sans-serif] min-h-[70px] tracking-wide  z-50">
        <div className="flex flex-wrap items-center justify-between gap-4 w-full">
          <a
            href="/"
            className="flex items-center"
          >
            <div className="w-[100px] top-0 bottom-0 absolute left-2 h-[70px] overflow-hidden">
              <img
                src={logo}
                alt="KeyChains By Bogy Logo"
                className="object-cover w-full h-full scale-150"
              />
            </div>
            <span className="font-bold ml-16 text-black pl-3 text-lg hidden lg:block">
              KeyChains By Bogy
            </span>
          </a>

          <div
            className={`flex items-start justify-end fixed inset-0  p-6 lg:p-0 lg:static lg:flex lg:bg-transparent z-50`}
          >
            <button className="lg:hidden absolute top-4 right-4 z-[100] rounded-full bg-white p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 fill-black"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <div className="lg:flex lg:items-center lg:w-auto w-full md:w-[50%] h-full lg:bg-transparent bg-pink-500 lg:p-0 p-8">
              <a
                href="/"
                className="block lg:inline-block text-black px-3 py-2 rounded text-lg font-medium"
              >
                Products
              </a>
              <a
                href="/"
                className="block lg:inline-block text-black px-3 py-2 rounded text-lg font-medium"
              >
                About Us
              </a>
              <a
                href="/"
                className="block lg:inline-block text-black px-3 py-2 rounded mr-3 text-lg font-medium"
              >
                Contact
              </a>
            </div>
          </div>

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
