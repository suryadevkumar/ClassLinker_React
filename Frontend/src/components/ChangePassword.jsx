import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaCheck } from "react-icons/fa";
import { updatePassword, login } from "../routes/authRoutes";

const ChangePassword = () => {
    const location = useLocation();
    let userType = location.state?.userType;
    const [step, setStep] = useState(1);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleVerifyPassword = async (e) => {
        e.preventDefault();
        if (!oldPassword) {
            toast.error("Please enter your current password");
            return;
        }

        setIsLoading(true);
        try {
            const response = await login(userType.toLowerCase(), null, oldPassword);
            if (response.success) {
                setStep(2);
            } else {
                toast.error("Incorrect password");
            }
        } catch (error) {
            toast.error("An error occurred while verifying password");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) {
            toast.error("Please enter and confirm your new password");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }
        if (newPassword === oldPassword) {
            toast.error("New password must be different from old password");
            return;
        }

        setIsLoading(true);
        try {
            const response = await updatePassword(userType, null, newPassword);
            if (response.success) {
                toast.success("Password updated successfully");
                navigate(`/${userType.toLowerCase()}/dashboard`);
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
        <div className="flex justify-center items-center h-[calc(100vh-8rem)] bg-gray-100 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    {/* Header with back button for step 2 */}
                    <div className="flex items-center mb-6">
                        {step === 2 && (
                            <button 
                                onClick={() => setStep(1)}
                                className="mr-4 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <FaArrowLeft size={20} />
                            </button>
                        )}
                        <h2 className="text-2xl font-bold text-gray-800">
                            {step === 1 ? `Verify ${userType} Password` : `Set New Password`}
                        </h2>
                    </div>

                    {/* Step 1: Verify Current Password */}
                    {step === 1 && (
                        <form onSubmit={handleVerifyPassword}>
                            <div className="mb-6">
                                <label className="block mb-2 font-medium text-gray-700">Current Password</label>
                                <div className="flex items-center border border-gray-300 rounded-lg p-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                                    <FaLock className="text-gray-400 mr-3" />
                                    <input
                                        required
                                        type={showOldPassword ? "text" : "password"}
                                        placeholder="Enter current password"
                                        className="flex-1 focus:outline-none"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                    />
                                    <button 
                                        type="button"
                                        className="text-gray-500 hover:text-gray-700 ml-2"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                    >
                                        {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Verifying...
                                    </span>
                                ) : (
                                    "Continue"
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Set New Password */}
                    {step === 2 && (
                        <form onSubmit={handleUpdatePassword}>
                            <div className="mb-4">
                                <label className="block mb-2 font-medium text-gray-700">New Password</label>
                                <div className="flex items-center border border-gray-300 rounded-lg p-3 mb-4 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                                    <FaLock className="text-gray-400 mr-3" />
                                    <input
                                        required
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder="Enter new password"
                                        className="flex-1 focus:outline-none"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <button 
                                        type="button"
                                        className="text-gray-500 hover:text-gray-700 ml-2"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="mb-6">
                                <label className="block mb-2 font-medium text-gray-700">Confirm New Password</label>
                                <div className="flex items-center border border-gray-300 rounded-lg p-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                                    <FaLock className="text-gray-400 mr-3" />
                                    <input
                                        required
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm new password"
                                        className="flex-1 focus:outline-none"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <button 
                                        type="button"
                                        className="text-gray-500 hover:text-gray-700 ml-2"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Updating...
                                    </span>
                                ) : (
                                    <>
                                        <FaCheck className="mr-2" />
                                        Change Password
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;