import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaShieldAlt, FaArrowLeft } from "react-icons/fa";
import { checkEmailUsed, sendOtp, updatePassword, verifyOtp } from "../routes/authRoutes";

const ResetPassword = () => {
    const location = useLocation();
    let userType = location.state?.userType;
    if (userType === "Admin") userType = "Institute";
    
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [isVerifying, setIsVerifying] = useState(false);
    const navigate = useNavigate();
    const otpInputs = useRef([]);

    // Focus management for OTP inputs
    useEffect(() => {
        if (step === 2 && otpInputs.current[0]) {
            otpInputs.current[0].focus();
        }
    }, [step]);

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
        const fullOtp = otp.join("");
        if (fullOtp.length !== 6) {
            toast.error("Please enter a 6-digit OTP");
            return;
        }

        setIsVerifying(true);
        try {
            const res = await verifyOtp(email, fullOtp);
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
                navigate(`/${userType.toLowerCase()}/login`);
            } else {
                toast.error(response.message || "Failed to update password");
            }
        } catch (error) {
            toast.error("An error occurred while updating password");
        } finally {
            setIsLoading(false);
        }
    };

    // Determine color scheme based on user type
    const getColorScheme = () => {
        switch(userType.toLowerCase()) {
            case 'student':
                return { primary: 'bg-blue-600', hover: 'hover:bg-blue-700', focus: 'focus:ring-blue-500' };
            case 'teacher':
                return { primary: 'bg-green-600', hover: 'hover:bg-green-700', focus: 'focus:ring-green-500' };
            case 'institute':
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
                    {/* Header with dynamic color accent */}
                    <div className={`${colors.primary} py-4 px-6`}>
                        <h2 className="text-xl font-bold text-white text-center">
                            {userType} Password Reset
                        </h2>
                    </div>

                    <div className="p-8">
                        {/* Step 1: Email Input */}
                        {step === 1 && (
                            <form className="space-y-6" onSubmit={handleSendOTP}>
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

                                <div className="flex items-center justify-between">
                                    <Link
                                        to={`/${userType.toLowerCase()}/login`}
                                        className="text-sm text-blue-600 hover:text-blue-500 hover:underline"
                                    >
                                        Back to Login
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${colors.primary} ${colors.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors.focus} disabled:opacity-70`}
                                >
                                    {isLoading ? "Sending OTP..." : "Send OTP"}
                                </button>

                                <div className="text-center text-sm">
                                    <span className="text-gray-600">Don't have an account? </span>
                                    <Link
                                        to={`/${userType.toLowerCase()}/signup`}
                                        className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
                                    >
                                        Sign up
                                    </Link>
                                </div>
                            </form>
                        )}

                        {/* Step 2: OTP Verification */}
                        {step === 2 && (
                            <form className="space-y-6" onSubmit={handleVerifyOTP}>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex items-center text-blue-600 hover:text-blue-500 text-sm font-medium"
                                >
                                    <FaArrowLeft className="mr-1" />
                                    Back to email
                                </button>

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

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleSendOTP}
                                        disabled={resendTimer > 0 || isLoading}
                                        className={`flex-1 py-3 rounded-md shadow-sm text-sm font-medium ${
                                            resendTimer > 0 || isLoading
                                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                : "bg-gray-600 text-white hover:bg-gray-700"
                                        }`}
                                    >
                                        {resendTimer > 0 ? `Resend (${resendTimer}s)` : "Resend OTP"}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isVerifying}
                                        className={`flex-1 ${colors.primary} ${colors.hover} text-white py-3 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors.focus} disabled:opacity-70`}
                                    >
                                        {isVerifying ? "Verifying..." : "Verify OTP"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Step 3: New Password */}
                        {step === 3 && (
                            <form className="space-y-6" onSubmit={handleResetPassword}>
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="flex items-center text-blue-600 hover:text-blue-500 text-sm font-medium"
                                >
                                    <FaArrowLeft className="mr-1" />
                                    Back to OTP
                                </button>

                                <div className="space-y-2">
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                        New Password
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaLock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="newPassword"
                                            name="newPassword"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            className={`focus:ring-2 ${colors.focus} focus:border-transparent block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md`}
                                            placeholder="New Password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
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

                                <div className="space-y-2">
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                        Confirm Password
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaLock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            className={`focus:ring-2 ${colors.focus} focus:border-transparent block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md`}
                                            placeholder="Confirm Password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${colors.primary} ${colors.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors.focus} disabled:opacity-70`}
                                >
                                    {isLoading ? "Updating..." : "Change Password"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;