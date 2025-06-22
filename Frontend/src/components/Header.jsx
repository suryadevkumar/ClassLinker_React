import Logo from "../assets/img/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../routes/authRoutes";
import { toast } from "react-toastify";

const Header = () => {
  const authDataString = localStorage.getItem("userAuthData");
  const authData = authDataString ? JSON.parse(authDataString) : null;
  const navigate = useNavigate();

    const handleLogout = async () => {
        const response = await logout();
        if(response.success){
          navigate("/");
          localStorage.removeItem("userAuthData")
          toast.success(response.message);
        } 
    };

  return (
    <>
      <header className="h-16 bg-gradient-to-r from-indigo-600 to-blue-500 shadow-lg fixed w-full top-0">
        <div className="container mx-auto px-4 h-full flex justify-between items-center">
          <Link to={authData && authData?.userType?`/${authData.userType}/dashboard`:"/"} 
            className="flex items-center h-full">
            <img
              src={Logo}
              alt="logo"
              className="h-3/4 transition-transform hover:scale-105"
            />
            <span className="ml-3 text-white font-bold text-xl">
              ClassLinker
            </span>
          </Link>

          <nav className="hidden py-4 md:block h-full">
            <ul className="flex space-x-6 h-full items-center">
              <li className="h-full flex items-center">
                <Link
                  to={authData ? `/${authData.userType}/dashboard`:"/"}
                  className="text-white hover:text-indigo-200 font-medium transition-colors px-3 py-2 rounded-md hover:bg-white/10 h-full flex items-center"
                >
                  {authData?"Dashboard":"Home"}
                </Link>
              </li>
              {!authData && <li className="h-full flex items-center">
                <Link
                  to="#"
                  className="text-white hover:text-indigo-200 font-medium transition-colors px-3 py-2 rounded-md hover:bg-white/10 h-full flex items-center"
                >
                  Contact
                </Link>
              </li>}
              {!authData && <li className="h-full flex items-center">
                <Link
                  to="#"
                  className="text-white hover:text-indigo-200 font-medium transition-colors px-3 py-2 rounded-md hover:bg-white/10 h-full flex items-center"
                >
                  About
                </Link>
              </li>}
              {authData && <li className="h-full flex items-center">
                <button
                  onClick={handleLogout}
                  className="bg-white text-indigo-600 hover:bg-indigo-50 font-medium transition-colors px-4 py-2 rounded-md ml-4 h-full flex items-center"
                >
                  LogOut
                </button>
              </li>}
            </ul>
          </nav>

          <button className="md:hidden text-white focus:outline-none">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
        </div>
      </header>
      <div className="mt-16"></div>
    </>
  );
};

export default Header;
