import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { login, sendOtp, verifyOtp } from "../routes/authRoutes";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaShieldAlt, FaArrowLeft } from "react-icons/fa";

const InstituteLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(0);
  const otpInputs = useRef([]);

  // Focus management for OTP inputs
  useEffect(() => {
    if (step === 2 && otpInputs.current[0]) {
      otpInputs.current[0].focus();
    }
  }, [step]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      otpInputs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  const sendOTP = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password!");
      return;
    }

    const response = await login("institute", email, password);
    if (response.success && response.userType === "institute") {
      setStep(2);
      setTimer(59);
      const otpResponse = await sendOtp(email);
      if (otpResponse.success) {
        toast.success(otpResponse.message);
      } else {
        toast.error(otpResponse.message);
      }
    } else {
      toast.error("Incorrect username or password");
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
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      toast.error("Please enter a 6-digit OTP!");
      return;
    }

    const response = await verifyOtp(email, fullOtp);
    if (response.success) {
      navigate("/institute/dashboard");
    } else {
      toast.error(response.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Header with purple accent (matching institute color scheme) */}
          <div className="bg-purple-600 py-4 px-6">
            <h2 className="text-xl font-bold text-white text-center">
              Institute Login
            </h2>
          </div>

          <div className="p-8">
            {step === 1 ? (
              <form className="space-y-6" onSubmit={sendOTP}>
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
                      className="focus:ring-2 focus:ring-purple-500 focus:border-transparent block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md"
                      placeholder="institute@example.com"
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
                      className="focus:ring-2 focus:ring-purple-500 focus:border-transparent block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md"
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

                {/* Links */}
                <div className="flex items-center justify-between">
                  <Link
                    to="/admin/login"
                    className="text-sm text-purple-600 hover:text-purple-500 hover:underline"
                  >
                    Admin Login
                  </Link>
                  <Link
                    to="/reset/password"
                    state={{ userType: "Institute" }}
                    className="text-sm text-purple-600 hover:text-purple-500 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Send OTP
                  </button>
                </div>

                {/* Sign Up Link */}
                <div className="text-center text-sm">
                  <span className="text-gray-600">Don't have an account? </span>
                  <Link
                    to="/institute/signup"
                    className="font-medium text-purple-600 hover:text-purple-500 hover:underline"
                  >
                    Sign up
                  </Link>
                </div>
              </form>
            ) : (
              <form className="space-y-6" onSubmit={instituteLogin}>
                {/* Back button */}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center text-purple-600 hover:text-purple-500 text-sm font-medium"
                >
                  <FaArrowLeft className="mr-1" />
                  Back to login
                </button>

                {/* OTP Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Enter 6-digit OTP
                  </label>
                  <div className="flex justify-center space-x-3">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputs.current[index] = el)}
                        type="text"
                        maxLength="1"
                        className="w-12 h-12 text-center text-xl border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        value={otp[index]}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    We've sent a verification code to your email
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={resendOTP}
                    disabled={timer > 0}
                    className={`flex-1 py-3 rounded-md shadow-sm text-sm font-medium ${
                      timer > 0
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-gray-600 text-white hover:bg-gray-700"
                    }`}
                  >
                    {timer > 0 ? `Resend (${timer}s)` : "Resend OTP"}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Verify & Login
                  </button>
                </div>

                <div className="text-center text-sm">
                  <Link
                    to="/adminLogin"
                    className="text-purple-600 hover:text-purple-500 hover:underline"
                  >
                    Admin Login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstituteLogin;