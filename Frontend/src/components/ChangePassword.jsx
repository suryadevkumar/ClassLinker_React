import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import lock_img from "../assets/img/lock.png";
import show_img from "../assets/img/show.png";
import hide_img from "../assets/img/hide.png";
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
                navigate('/instituteDashboard');
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
        <div className="flex justify-center items-center py-16 bg-gray-100">
            <div className="container w-[400px] mb-3">
                <div className="login-form bg-white p-8 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-6 text-center">
                        Change {userType} Password
                    </h2>

                    {/* Step 1: Verify Current Password */}
                    {step === 1 && (
                        <form onSubmit={handleVerifyPassword}>
                            <div className="mb-6">
                                <label className="block mb-2 font-medium">Current Password</label>
                                <div className="login_input flex items-center border border-gray-300 rounded-lg p-2">
                                    <img src={lock_img} alt="Password Icon" width="23px" className="mr-2"/>
                                    <input
                                        required
                                        type={showOldPassword ? "text" : "password"}
                                        placeholder="Enter current password"
                                        className="input w-full focus:outline-none"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                    />
                                    <img 
                                        src={showOldPassword ? hide_img : show_img} 
                                        alt="toggle password visibility" 
                                        width="23px" 
                                        className="cursor-pointer" 
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                    />
                                </div>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? "Verifying..." : "Continue"}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Set New Password */}
                    {step === 2 && (
                        <form onSubmit={handleUpdatePassword}>
                            <div className="mb-4">
                                <label className="block mb-2 font-medium">New Password</label>
                                <div className="login_input flex items-center border border-gray-300 rounded-lg p-2 mb-4">
                                    <img src={lock_img} alt="Password Icon" width="23px" className="mr-2"/>
                                    <input
                                        required
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder="Enter new password"
                                        className="input w-full focus:outline-none"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <img 
                                        src={showNewPassword ? hide_img : show_img} 
                                        alt="toggle password visibility" 
                                        width="23px" 
                                        className="cursor-pointer" 
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    />
                                </div>
                            </div>
                            
                            <div className="mb-6">
                                <label className="block mb-2 font-medium">Confirm New Password</label>
                                <div className="login_input flex items-center border border-gray-300 rounded-lg p-2">
                                    <img src={lock_img} alt="Password Icon" width="23px" className="mr-2"/>
                                    <input
                                        required
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm new password"
                                        className="input w-full focus:outline-none"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <img 
                                        src={showConfirmPassword ? hide_img : show_img} 
                                        alt="toggle password visibility" 
                                        width="23px" 
                                        className="cursor-pointer" 
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    />
                                </div>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
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

export default ChangePassword;