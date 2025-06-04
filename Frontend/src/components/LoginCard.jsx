import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import mail_img from "../assets/img/mail.png";
import lock_img from "../assets/img/lock.png";
import show_img from "../assets/img/show.png";
import hide_img from "../assets/img/hide.png";
import { Link } from "react-router-dom";
import { login } from "../routes/authRoutes.js";

const LoginCard = ({ login_type }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState("password");
  const [hideImg, setHideImg] = useState(hide_img);
  const navigate = useNavigate();

  const passwordShow = () => {
    setType(type === "password" ? "text" : "password");
    setHideImg(type === "password" ? show_img : hide_img);
  };

  const UserLogin = async (e) => {
    if (!email || !password) return;
    e.preventDefault();
    const response = await login(login_type.toLowerCase(), email, password);
    if (response.success) {
      if (response.userType == "student") navigate("/studentDashboard");
      else if (response.userType == "teacher") navigate("/teacherDashboard");
      else if (response.userType == "admin") navigate("/adminDashboard");
    } else toast.error("Incorrect Username or Password");
  };

  return (
    <>
      <div className="flex justify-center items-center py-36 bg-gray-100">
        <div className="container w-[400px] mb-3">
          <div className="login-form bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">
              {login_type} Login
            </h2>
            <form>
              <div className="login_input flex items-center border border-gray-300 rounded-lg p-2 mb-4">
                <img
                  src={mail_img}
                  alt="Email Icon"
                  width="22px"
                  className="mr-2"
                />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  className="input w-full focus:outline-none"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                />
              </div>
              <div className="login_input flex items-center border border-gray-300 rounded-lg p-2 mb-4">
                <img
                  src={lock_img}
                  alt="Password Icon"
                  width="23px"
                  className="mr-2"
                />
                <input
                  required
                  type={type}
                  placeholder="Your Password"
                  className="input w-full focus:outline-none"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                />
                <img
                  src={hideImg}
                  alt="hide_password"
                  width="23px"
                  className="cursor-pointer"
                  onClick={passwordShow}
                />
              </div>
              <div className="flex justify-between items-center mb-4">
                {login_type == "Admin" ? (
                  <Link
                    to="/instituteLogin"
                    class="text-blue-500 hover:underline"
                  >
                    Institute Login
                  </Link>
                ) : (
                  <div class="flex items-center">
                    <input type="checkbox" class="mr-2" />
                    <label>Remember me</label>
                  </div>
                )}
                <Link
                  to="/resetPassword"
                  state={{ userType: login_type }}
                  className="text-blue-500 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <button
                type="submit"
                onClick={UserLogin}
                className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Log In
              </button>
              <p className="text-center mt-4">
                Don't have an account?{" "}
                <Link
                  to={`/${login_type.toLowerCase()}Signup`}
                  className="text-blue-500 hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginCard;
