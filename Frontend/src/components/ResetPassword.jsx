import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import mail_img from "../assets/img/mail.png";
import lock_img from "../assets/img/lock.png";
import show_img from "../assets/img/show.png";
import hide_img from "../assets/img/hide.png";
import otp_img from "../assets/img/otp.png";
import {
    checkEmailUsed,
    sendOtp,
    updatePassword,
    verifyOtp,
} from "../routes/authRoutes";

const ResetPassword = () => {
    const location = useLocation();
    let userType = location.state?.userType;
    if (userType == "Admin") userType = "Institute";
    
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordType, setPasswordType] = useState("password");
    const [hideImg, setHideImg] = useState(hide_img);
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [isVerifying, setIsVerifying] = useState(false);
    const navigate = useNavigate();

    // Timer effect for resend OTP
    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const passwordShow = () => {
        setPasswordType(passwordType === "password" ? "text" : "password");
        setHideImg(passwordType === "password" ? show_img : hide_img);
    };

    const handleSendOTP = async (e) => {
        if (e) e.preventDefault();
        if (!email) {
            toast.error("Email is required");
            return;
        }

        setIsLoading(true);
        try {
            const response = await checkEmailUsed(email);
            if (response.success && response?.userType === userType.toLowerCase()) {
                setStep(2);
                setResendTimer(59);
                const otpResponse = await sendOtp(email);
                if (otpResponse.success) {
                    toast.success(otpResponse.message);
                } else {
                    toast.error(otpResponse.message);
                }
            } else {
                toast.error("User not Found!");
            }
        } catch (error) {
            toast.error("An error occurred while sending OTP");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (!otp) {
            toast.error("OTP is required");
            return;
        }

        setIsVerifying(true);
        try {
            const res = await verifyOtp(email, otp);
            if (res.success) {
                setStep(3);
                toast.success(res.message);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("An error occurred while verifying OTP");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) {
            toast.error("Both password fields are required");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }

        setIsLoading(true);
        try {
            const response = await updatePassword(userType, email, newPassword);
            if (response.success) {
                toast.success("Password updated successfully");
                navigate(`/${userType.toLowerCase()}Login`);
            } else {
                toast.error(response.message || "Failed to update password");
            }
        } catch (error) {
            toast.error("An error occurred while updating password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center py-36 bg-gray-100">
            <div className="container w-[400px] mb-3">
                <div className="login-form bg-white p-8 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-4 text-center">
                        {userType} Reset Password
                    </h2>

                    {/* Step 1: Email Input */}
                    {step === 1 && (
                        <form onSubmit={handleSendOTP}>
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
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <Link
                                to={`/${userType.toLowerCase()}Login`}
                                className="text-blue-500 hover:underline mb-4 inline-block"
                            >
                                {userType} Login
                            </Link>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? "Sending..." : "Send OTP"}
                            </button>
                            <p className="text-center mt-4">
                                Don't have an account?{" "}
                                <Link
                                    to={`/${userType.toLowerCase()}Signup`}
                                    className="text-blue-500 hover:underline"
                                >
                                    Sign up
                                </Link>
                            </p>
                        </form>
                    )}

                    {/* Step 2: OTP Verification */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOTP}>
                            <div className="login_input flex items-center border border-gray-300 rounded-lg p-2 mb-4">
                                <img
                                    src={otp_img}
                                    alt="OTP Icon"
                                    width="23px"
                                    className="mr-2"
                                />
                                <input
                                    required
                                    type="text"
                                    placeholder="Enter OTP"
                                    className="input w-full focus:outline-none"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-between mb-4">
                                <button
                                    type="button"
                                    onClick={handleSendOTP}
                                    disabled={resendTimer > 0 || isLoading}
                                    className="w-[48%] bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                                >
                                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isVerifying}
                                    className="w-[48%] bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                                >
                                    {isVerifying ? "Verifying..." : "Verify OTP"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 3: New Password */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword}>
                            <div className="mb-4">
                                <label className="block mb-2">New Password:</label>
                                <div className="login_input flex items-center border border-gray-300 rounded-lg p-2">
                                    <img
                                        src={lock_img}
                                        alt="Password Icon"
                                        width="23px"
                                        className="mr-2"
                                    />
                                    <input
                                        required
                                        type={passwordType}
                                        placeholder="New Password"
                                        className="input w-full focus:outline-none"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <img
                                        src={hideImg}
                                        alt="toggle password visibility"
                                        width="23px"
                                        className="cursor-pointer"
                                        onClick={passwordShow}
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2">Confirm Password:</label>
                                <div className="login_input flex items-center border border-gray-300 rounded-lg p-2">
                                    <img
                                        src={lock_img}
                                        alt="Password Icon"
                                        width="23px"
                                        className="mr-2"
                                    />
                                    <input
                                        required
                                        type={passwordType}
                                        placeholder="Confirm Password"
                                        className="input w-full focus:outline-none"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? "Updating..." : "Change Password"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;