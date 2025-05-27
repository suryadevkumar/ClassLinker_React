import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import mail_img from "../assets/img/mail.png";
import lock_img from "../assets/img/lock.png";
import otp_img from "../assets/img/otp.png";
import show_img from "../assets/img/show.png";
import hide_img from "../assets/img/hide.png";
import { Link, useNavigate } from 'react-router-dom';
import { login, sendOtp, verifyOtp } from '../routes/authRoutes';

const InstituteLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [OTP, setOTP] = useState("");
  const [step, setStep] = useState(1);
  const [type, setType] = useState("password");
  const [hideImg, setHideImg] = useState(hide_img);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const passwordShow = () => {
    setType(type === "password" ? "text" : "password");
    setHideImg(type === "password" ? show_img : hide_img);
  };

  const sendOTP = async (e) => {
    e.preventDefault();
    if (!email || !password)
      return toast.error("Please Enter Email and Password!");

    const response = await login("institute", email, password);

    if (response.success && response.userType === "institute") {
      setStep(2);
      setTimer(59);
      const response = await sendOtp(email);
      if (response.success) return toast.success(response.message);
      else return toast.error(response.message);
    } else {
      return toast.error('Incorrect Username or Password');
    }
  };

  const resendOTP = async () => {
    if (timer > 0) return;
    setTimer(59);
    
    const response = await sendOtp(email);
    if (response.success) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
      setTimer(0);
    }
  };

  const instituteLogin = async (e) => {
    e.preventDefault();
    if (!OTP) {
      toast.error("Please Enter OTP!");
      return;
    }
    const response = await verifyOtp(email, OTP);
    if (response.success){
      localStorage.removeItem("userType");
      navigate('/instituteDashboard');
    } 
    else return toast.error(response.message);
  };

  return (
    <section className="flex justify-center items-center py-36 bg-gray-100">
      <div className="container w-[400px] mb-3">
        <div className="login-form bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">Institute Login</h2>
          <form>
            {step === 1 && (
              <div>
                <div className="login_input flex items-center border border-gray-300 rounded-lg p-2 mb-4">
                  <img src={mail_img} alt="Email Icon" width="22px" className="mr-2" />
                  <input
                    required
                    type="email"
                    placeholder="Email"
                    className="input w-full focus:outline-none"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value) }}
                  />
                </div>
                <div className="login_input flex items-center border border-gray-300 rounded-lg p-2 mb-4">
                  <img src={lock_img} alt="Password Icon" width="23px" className="mr-2" />
                  <input
                    required
                    type={type}
                    placeholder="Your Password"
                    className="input w-full focus:outline-none"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value) }}
                  />
                  <img src={hideImg} alt="hide_password" width="23px" className="cursor-pointer" onClick={passwordShow} />
                </div>
                <div className="flex justify-between mb-4">
                  <Link to="/adminLogin" className="text-blue-500 hover:underline">Admin Login</Link>
                  <a href="institute-forget-pass.html" className="text-blue-500 hover:underline">Forgot password?</a>
                </div>
                <button
                  type="submit"
                  onClick={sendOTP}
                  className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Send OTP
                </button>
                <p className="text-center mt-4">
                  Don't have an account?{' '}
                  <Link to="/instituteSignup" className="text-blue-500 hover:underline">Sign up</Link>
                </p>
              </div>
            )}

            {step === 2 && (
              <div>
                <label className="block mb-2">Enter Your OTP:</label>
                <div className="login_input flex items-center border border-gray-300 rounded-lg p-2 mb-4">
                  <img src={otp_img} alt="OTP Icon" width="23px" className="mr-2" />
                  <input
                    required
                    type="text"
                    placeholder="Your OTP"
                    className="input w-full focus:outline-none"
                    value={OTP}
                    onChange={(e) => { setOTP(e.target.value) }}
                  />
                </div>
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={resendOTP}
                    disabled={timer > 0}
                    className={`flex-1 py-2 rounded-lg transition-colors ${
                      timer > 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gray-800 text-white hover:bg-gray-700"
                    }`}
                  >
                    {timer > 0 ? `Resend OTP (${timer}s)` : "Resend OTP"}
                  </button>
                  <button
                    type="submit"
                    onClick={instituteLogin}
                    className="flex-1 bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Log In
                  </button>
                </div>
                <p className="text-center mt-4">
                  <Link to="/adminLogin" className="text-blue-500 hover:underline">Admin Login</Link>
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default InstituteLogin;