import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { login } from "../routes/authRoutes";

const LoginCard = ({ login_type }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const UserLogin = async (e) => {
    if (!email || !password) return;
    e.preventDefault();
    const response = await login(login_type.toLowerCase(), email, password);
    console.log(response)
    if (response.success) {
      navigate(`/${login_type.toLowerCase()}/dashboard`)
    } else toast.error("Incorrect Username or Password");
  };

  // Determine color scheme based on login type
  const getColorScheme = () => {
    switch(login_type.toLowerCase()) {
      case 'student':
        return { primary: 'bg-blue-600', hover: 'hover:bg-blue-700', focus: 'focus:ring-blue-500' };
      case 'teacher':
        return { primary: 'bg-green-600', hover: 'hover:bg-green-700', focus: 'focus:ring-green-500' };
      case 'admin':
        return { primary: 'bg-purple-600', hover: 'hover:bg-purple-700', focus: 'focus:ring-purple-500' };
      default:
        return { primary: 'bg-indigo-600', hover: 'hover:bg-indigo-700', focus: 'focus:ring-indigo-500' };
    }
  };

  const colors = getColorScheme();

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Header with colored accent */}
          <div className={`${colors.primary} py-4 px-6`}>
            <h2 className="text-xl font-bold text-white text-center">
              {login_type} Login
            </h2>
          </div>
          
          <div className="p-8">
            <form className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`focus:ring-2 ${colors.focus} focus:border-transparent block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md`}
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className={`focus:ring-2 ${colors.focus} focus:border-transparent block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-600 focus:outline-none"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <FaEyeSlash className="h-5 w-5" />
                      ) : (
                        <FaEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Remember Me / Forgot Password */}
              <div className="flex items-center justify-between">
                {login_type === "Admin" ? (
                  <Link
                    to="/institute/login"
                    className="text-sm text-blue-600 hover:text-blue-500 hover:underline"
                  >
                    Institute Login
                  </Link>
                ) : (
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                )}
                <Link
                  to="/reset/password"
                  state={{ userType: login_type }}
                  className="text-sm text-blue-600 hover:text-blue-500 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  onClick={UserLogin}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${colors.primary} ${colors.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors.focus}`}
                >
                  Log In
                </button>
              </div>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <Link
                to={login_type==="Admin"?`/institute/signup`:`/${login_type.toLowerCase()}/signup`}
                className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginCard;