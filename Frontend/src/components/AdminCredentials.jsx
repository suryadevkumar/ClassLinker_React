import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaUser, FaPhone, FaEnvelope, FaCamera, FaCheck, FaTimes, FaSpinner, FaArrowLeft } from "react-icons/fa";
import { getAdminDetails } from "../routes/adminRoutes";
import { useNavigate } from "react-router-dom";
import { checkEmailUsed, sendOtp, verifyOtp } from "../routes/authRoutes";
import { updateAdminDetails } from "../routes/insRoutes";

const AdminCredentials = () => {
    // State for admin data
    const [adminData, setAdminData] = useState({
        adminName: "",
        adminMobile: "",
        adminEmail: "",
        adminPic: "",
        instituteEmail: ""
    });

    // State for form fields
    const [formData, setFormData] = useState({
        newName: "",
        newMobile: "",
        newEmail: "",
        otp: "",
        instituteOtp: "",
    });

    // State for UI controls
    const [loading, setLoading] = useState(true);
    const [showNameField, setShowNameField] = useState(false);
    const [showMobileField, setShowMobileField] = useState(false);
    const [showEmailField, setShowEmailField] = useState(false);
    const [showOtpField, setShowOtpField] = useState(false);
    const [showInstituteOtpField, setShowInstituteOtpField] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [instituteOtpVerified, setInstituteOtpVerified] = useState(false);
    const [imagePreview, setImagePreview] = useState("");
    const [imageChanged, setImageChanged] = useState(false);
    const [imageWarning, setImageWarning] = useState("");
    const [otpCountdown, setOtpCountdown] = useState(0);
    const [processing, setProcessing] = useState(false);

    const navigate = useNavigate();

    // Fetch admin data on component mount
    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                setLoading(true);
                const data = await getAdminDetails();
                setAdminData(data);
                if (data.adminPic) {
                    setImagePreview(`data:image/jpeg;base64,${data.adminPic}`);
                }
            } catch (error) {
                toast.error("Failed to load admin data");
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, []);

    // Handle OTP countdown
    useEffect(() => {
        let timer;
        if (otpCountdown > 0) {
            timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [otpCountdown]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type === "image/jpeg" || file.type === "image/jpg") {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setImagePreview(e.target.result);
                    setImageWarning("");
                    setImageChanged(true);
                };
                reader.readAsDataURL(file);
            } else {
                setImagePreview("");
                setImageWarning("Only JPEG/JPG images are allowed");
            }
        }
    };

    const toggleNameField = () => {
        setShowNameField(!showNameField);
        if (showNameField) setFormData({ ...formData, newName: "" });
        resetVerificationStates();
    };

    const toggleMobileField = () => {
        setShowMobileField(!showMobileField);
        if (showMobileField) setFormData({ ...formData, newMobile: "" });
        resetVerificationStates();
    };

    const toggleEmailField = () => {
        setShowEmailField(!showEmailField);
        if (showEmailField) {
            setFormData({ ...formData, newEmail: "", otp: "" });
            setOtpVerified(false);
            setShowOtpField(false);
        }
        resetVerificationStates();
    };

    const resetVerificationStates = () => {
        setShowInstituteOtpField(false);
        setShowConfirmation(false);
        setInstituteOtpVerified(false);
    };

    const sendAdminOtp = async () => {
        if (!formData.newEmail) {
            toast.error("Please enter new email");
            return;
        }
        
        try {
            const response = await checkEmailUsed(formData.newEmail);
            if (response.success) {
                toast.error("Email already in use");
                return;
            }
            
            setShowOtpField(true);
            setOtpCountdown(59);

            const otpResponse = await sendOtp(formData.newEmail);
            toast.success(otpResponse.message || "OTP sent successfully");
        } catch (error) {
            toast.error("Failed to send OTP");
        }
    };

    const validateAdminOtp = async () => {
        const response = await verifyOtp(formData.newEmail, formData.otp);
        try {
            if (response.success) {
                setOtpVerified(true);
                toast.success("Email verified successfully");
            } else {
                setFormData({ ...formData, otp: "" });
                toast.error(response.message || "Invalid OTP");
            }
        } catch (error) {
            toast.error("Failed to verify OTP");
        }
    };

    const updateCredentials = async () => {
        const hasNameChange = formData.newName && formData.newName !== adminData.adminName;
        const hasMobileChange = formData.newMobile && formData.newMobile !== adminData.adminMobile;
        const hasEmailChange = formData.newEmail && formData.newEmail !== adminData.adminEmail;

        if (!hasNameChange && !hasMobileChange && !hasEmailChange && !imageChanged) {
            toast.info("No changes detected");
            navigate("/institute/dashboard");
            return;
        }

        if (formData.newEmail && !otpVerified) {
            toast.error("Please verify your email first");
            return;
        }

        setShowInstituteOtpField(true);

        try {
            const response = await sendOtp(adminData.instituteEmail);
            toast.success(response.message || "Institute OTP sent");
        } catch (error) {
            toast.error("Failed to send institute OTP");
        }
    };

    const validateInstituteOtp = async () => {
        try {
            const response = await verifyOtp(adminData.instituteEmail, formData.instituteOtp);
            if (response.success) {
                toast.success("Institute OTP verified");
                setInstituteOtpVerified(true);
                setShowConfirmation(true);
            } else {
                setFormData({ ...formData, instituteOtp: "" });
                toast.error(response.message || "Invalid OTP");
            }
        } catch (error) {
            toast.error("Failed to verify institute OTP");
        }
    };

    const confirmChanges = async () => {
        try {
            setProcessing(true);
            const formDataToSend = new FormData();
            if (formData.newName) formDataToSend.append("adName", formData.newName);
            if (formData.newMobile) formDataToSend.append("adMob", formData.newMobile);
            if (formData.newEmail) formDataToSend.append("adEmail", formData.newEmail);

            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput.files[0]) {
                formDataToSend.append("photo", fileInput.files[0]);
            }

            const response = await updateAdminDetails(formDataToSend);
            toast.success(response.message || "Credentials updated successfully");
            navigate("/institute/dashborad");
        } catch (error) {
            toast.error("Failed to update credentials");
        } finally {
            setProcessing(false);
        }
    };

    const cancelChanges = () => {
        toast.info("Changes discarded");
        navigate("/institute/dashboard");
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-indigo-800">Loading admin data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <button
                        onClick={() => navigate("/institute/dashboard")}
                        className="mr-4 p-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                    >
                        <FaArrowLeft />
                    </button>
                    <h1 className="text-3xl font-bold text-indigo-800">Admin Credentials</h1>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative">
                            <img
                                src={imagePreview || "/default-profile.jpg"}
                                alt="Admin Profile"
                                className="w-32 h-32 rounded-full border-4 border-indigo-100 object-cover"
                            />
                            <label
                                htmlFor="adminPicUpdate"
                                className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors"
                            >
                                <FaCamera />
                                <input
                                    id="adminPicUpdate"
                                    type="file"
                                    accept="image/jpeg, image/jpg"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        {imageWarning && (
                            <p className="text-red-500 mt-2 text-sm">{imageWarning}</p>
                        )}
                    </div>

                    {/* Current Info */}
                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between bg-indigo-50 px-8 py-4 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Current Name</p>
                                <p className="text-lg font-semibold text-indigo-800">{adminData.adminName}</p>
                            </div>
                            <button
                                onClick={toggleNameField}
                                className="flex items-center px-6 my-1 bg-indigo-500 rounded-lg text-white hover:bg-indigo-700 transition-colors"
                            >
                                <FaUser className="mr-2" />
                                {showNameField ? "Cancel" : "Edit"}
                            </button>
                        </div>
                        {showNameField && (
                            <div className="">
                                <input
                                    type="text"
                                    name="newName"
                                    value={formData.newName}
                                    onChange={handleInputChange}
                                    placeholder="Enter new name"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        )}
                        <div className="flex justify-between bg-indigo-50 px-8 py-4 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Current Mobile</p>
                                <p className="text-lg font-semibold text-indigo-800">{adminData.adminMobile}</p>
                            </div>
                            <button
                                onClick={toggleMobileField}
                                className="flex items-center px-6 my-1 bg-indigo-500 rounded-lg text-white hover:bg-indigo-700 transition-colors"
                            >
                                <FaPhone className="mr-2" />
                                {showMobileField ? "Cancel" : "Edit"}
                            </button>
                        </div>
                        {showMobileField && (
                            <div>
                                <input
                                    type="text"
                                    name="newMobile"
                                    value={formData.newMobile}
                                    onChange={handleInputChange}
                                    placeholder="Enter new mobile number"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        )}
                        <div className="flex justify-between bg-indigo-50 px-8 py-4 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Current Email</p>
                                <p className="text-lg font-semibold text-indigo-800">{adminData.adminEmail}</p>
                            </div>
                            <button
                                onClick={toggleEmailField}
                                className="flex items-center px-6 my-1 bg-indigo-500 rounded-lg text-white hover:bg-indigo-700 transition-colors"
                            >
                                <FaEnvelope className="mr-2" />
                                {showEmailField ? "Cancel" : "Edit"}
                            </button>
                        </div>
                        {showEmailField && (
                                <div className="space-y-4">
                                    <div className="flex justify-between w-full">
                                        <input
                                            type="email"
                                            name="newEmail"
                                            value={formData.newEmail}
                                            onChange={handleInputChange}
                                            placeholder="Enter new email"
                                            className="p-3 border w-[75%] border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            readOnly={otpVerified}
                                        />
                                        <button
                                            type="button"
                                            onClick={sendAdminOtp}
                                            disabled={otpCountdown > 0 || otpVerified}
                                            className={`py-2 w-[23%] rounded-lg items-center ${otpCountdown > 0 || otpVerified
                                                    ? "bg-indigo-400 cursor-not-allowed"
                                                    : "bg-indigo-600 hover:bg-indigo-700"
                                                } text-white transition-colors`}
                                        >
                                            {otpCountdown > 0 ? (
                                                `Resend in 0:${otpCountdown < 10 ? "0" : ""}${otpCountdown}`
                                            ) : (
                                                "Send OTP"
                                            )}
                                        </button>
                                    </div>

                                    {showOtpField && (
                                        <div className="flex justify-between w-full">
                                            <input
                                                type="text"
                                                name="otp"
                                                value={formData.otp}
                                                onChange={handleInputChange}
                                                placeholder="Enter OTP"
                                                className="w-[75%] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                readOnly={otpVerified}
                                            />
                                            <button
                                                type="button"
                                                onClick={validateAdminOtp}
                                                disabled={otpVerified}
                                                className={`w-[23%] px-4 py-3 ${otpVerified
                                                    ? "bg-indigo-400 cursor-not-allowed"
                                                    : "bg-indigo-600 hover:bg-indigo-700"} text-white rounded-lg transition-colors`}
                                            >
                                                {otpVerified ? "Verified" : "Verify"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                    </div>
                </div>

                {/* Update Button */}
                <div className="flex justify-center">
                    <button
                        onClick={updateCredentials}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center"
                    >
                        Update Credentials
                    </button>
                </div>

                {/* Institute OTP Verification */}
                {showInstituteOtpField && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-indigo-800">Institute Verification</h2>
                                <button
                                    onClick={() => setShowInstituteOtpField(false)}
                                    className="text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    <FaTimes className="text-xl" />
                                </button>
                            </div>
                            <p className="mb-4 text-gray-600">
                                An OTP has been sent to your institute email ({adminData.instituteEmail}).
                                Please enter it below to verify your identity.
                            </p>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    name="instituteOtp"
                                    value={formData.instituteOtp}
                                    onChange={handleInputChange}
                                    placeholder="Enter Institute OTP"
                                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    readOnly={instituteOtpVerified}
                                />
                                <button
                                    type="button"
                                    onClick={validateInstituteOtp}
                                    disabled={instituteOtpVerified}
                                    className={`px-4 py-3 rounded-lg flex items-center ${instituteOtpVerified
                                            ? "bg-green-600"
                                            : "bg-indigo-600 hover:bg-indigo-700"
                                        } text-white transition-colors`}
                                >
                                    {instituteOtpVerified ? (
                                        <>
                                            <FaCheck className="mr-2" />
                                            Verified
                                        </>
                                    ) : (
                                        "Verify"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirmation Dialog */}
                {showConfirmation && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                        <div className="bg-white rounded-xl shadow-2xl px-6 py-12 w-full max-w-md">
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-bold text-indigo-800 mb-2">Confirm Changes</h2>
                                <p className="text-gray-600">
                                    Are you sure you want to update your admin credentials?
                                </p>
                            </div>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={cancelChanges}
                                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center"
                                >
                                    <FaTimes className="mr-2" />
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmChanges}
                                    disabled={processing}
                                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center"
                                >
                                    {processing ? (
                                        <>
                                            <FaSpinner className="animate-spin mr-2" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <FaCheck className="mr-2" />
                                            Confirm
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCredentials;