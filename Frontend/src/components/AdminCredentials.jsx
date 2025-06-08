import { useState, useEffect } from "react";
import { toast } from "react-toastify";
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

    const navigate = useNavigate();

    // Fetch admin data on component mount
    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const data = await getAdminDetails();
                setAdminData(data);
                if (data.adminPic) {
                    setImagePreview(`data:image/jpeg;base64,${data.adminPic}`);
                }
            } catch (error) {
                console.error("Error fetching admin data:", error);
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
                setImageWarning("Warning: The image should be in JPEG format.");
            }
        }
    };

    const toggleNameField = () => {
        setShowNameField(!showNameField);
        if (showNameField) {
            setFormData({ ...formData, newName: "" });
        }
        resetVerificationStates();
    };

    const toggleMobileField = () => {
        setShowMobileField(!showMobileField);
        if (showMobileField) {
            setFormData({ ...formData, newMobile: "" });
        }
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
            toast.error("Please enter new email!");
            return;
        }

        try {
            const response = await checkEmailUsed(formData.newEmail);
            if (response.success) {
                toast.error("Admin email is already in used!");
                return;
            }

            setShowOtpField(true);
            setOtpCountdown(59);

            const otpResponse = await sendOtp(formData.newEmail)
            if(otpResponse.success) toast.success(otpResponse.message);
            else toast.error(otpResponse.message);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const validateAdminOtp = async () => {
        try {
            const response = await verifyOtp(formData.newEmail, formData.otp);

            if (response.success) {
                setOtpVerified(true);
                toast.success(response.message);
            } else {
                setFormData({ ...formData, otp: "" });
                toast.error(response.message);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const updateCredentials = async () => {
        const hasNameChange =
            formData.newName && formData.newName !== adminData.adminName;
        const hasMobileChange =
            formData.newMobile && formData.newMobile !== adminData.adminMobile;
        const hasEmailChange =
            formData.newEmail && formData.newEmail !== adminData.adminEmail;

        if (
            !hasNameChange &&
            !hasMobileChange &&
            !hasEmailChange &&
            !imageChanged
        ) {
            navigate("/instituteDashboard");
            toast.success("No any update found!");
            return;
        }

        if (formData.newEmail && !otpVerified) {
            toast.error("Please Verify Admin Email!");
            return;
        }

        setShowInstituteOtpField(true);

        try {
            const response = await sendOtp(adminData.instituteEmail);
            if (response.success) toast.success(response.message);
            else toast.error(response.message);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const validateInstituteOtp = async () => {
        try {
            const response = await verifyOtp(adminData.instituteEmail, formData.instituteOtp);
            if (response.success) {
                toast.success(response.message);
                setInstituteOtpVerified(true);
                setShowConfirmation(true);
            } else {
                setFormData({ ...formData, instituteOtp: "" });
                toast.error(response.message);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const confirmChanges = async () => {
        const formDataToSend = new FormData();
        if (formData.newName) formDataToSend.append("adName", formData.newName);
        if (formData.newMobile) formDataToSend.append("adMob", formData.newMobile);
        if (formData.newEmail) formDataToSend.append("adEmail", formData.newEmail);

        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput.files[0]) {
            formDataToSend.append("photo", fileInput.files[0]);
        }

        try {
            const response = await updateAdminDetails(formDataToSend);
            if(response.success) toast.success(response.message);
            else toast.error(response.message);
            navigate("/instituteDashboard");
        } catch (error) {
            console.error(error);
        }
    };

    const cancelChanges = () => {
        toast.error("No any changes made!");
        navigate("/instituteDashboard");
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-ffecd2 to-fcb69f">
                <div className="text-xl font-semibold">Loading admin data...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-r from-ffecd2 to-fcb69f">
            <header className="bg-ff6f61 text-white py-4">
                <div className="container mx-auto flex justify-between items-center px-4">
                    <h1 className="text-xl ml-4">ClassLinker - Admin Credentials</h1>
                    <nav>
                        <ul className="flex space-x-4 mr-4">
                            <li>
                                <a href="index.html" className="text-white hover:underline">
                                    Home
                                </a>
                            </li>
                            <li>
                                <a href="#about" className="text-white hover:underline">
                                    About
                                </a>
                            </li>
                            <li>
                                <a href="contact.html" className="text-white hover:underline">
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </header>

            <main className="flex-grow flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl animate-slideIn">
                    <h2 className="text-2xl font-bold mb-6">Admin Credentials</h2>

                    {/* Profile Picture Section */}
                    <div className="text-center mb-6">
                        <img
                            src={imagePreview || adminData.adminPic}
                            alt="Admin Profile Picture"
                            className="w-44 h-52 rounded-lg object-cover border-2 border-gray-600 mx-auto mb-3"
                        />
                    </div>
                    <label htmlFor="adminPicUpdate" className="block mb-4 font-semibold">
                        Update Picture:
                    </label>
                    <input
                        type="file"
                        accept="image/jpeg"
                        onChange={handleImageChange}
                        className="block w-full text-sm mb-4 text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-gray-100 file:text-gray-700
                hover:file:bg-gray-200"
                    />
                    {imageWarning && <p className="text-red-500 mt-1">{imageWarning}</p>}

                    {/* Admin Details Form */}
                    <form className="space-y-4">
                        {/* Name Field */}
                        <div>
                            <label htmlFor="curName" className="block mb-1 font-semibold">
                                Current Name:
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={adminData.adminName}
                                    readOnly
                                    className="flex-grow p-2 border border-gray-300 rounded"
                                />
                                <button
                                    type="button"
                                    onClick={toggleNameField}
                                    className="w-1/4 bg-gray-800 text-white p-2 rounded hover:bg-gray-700 transition"
                                >
                                    {showNameField ? "Cancel" : "Edit"}
                                </button>
                            </div>
                        </div>

                        {showNameField && (
                            <div>
                                <label htmlFor="newName" className="block mb-1 font-semibold">
                                    Enter New Name:
                                </label>
                                <input
                                    type="text"
                                    name="newName"
                                    value={formData.newName}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    required
                                />
                            </div>
                        )}

                        {/* Mobile Field */}
                        <div>
                            <label htmlFor="curMob" className="block mb-1 font-semibold">
                                Current Mobile:
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={adminData.adminMobile}
                                    readOnly
                                    className="flex-grow p-2 border border-gray-300 rounded"
                                />
                                <button
                                    type="button"
                                    onClick={toggleMobileField}
                                    className="w-1/4 bg-gray-800 text-white p-2 rounded hover:bg-gray-700 transition"
                                >
                                    {showMobileField ? "Cancel" : "Edit"}
                                </button>
                            </div>
                        </div>

                        {showMobileField && (
                            <div>
                                <label htmlFor="newMobile" className="block mb-1 font-semibold">
                                    Enter New Mobile:
                                </label>
                                <input
                                    type="text"
                                    name="newMobile"
                                    value={formData.newMobile}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    required
                                />
                            </div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label htmlFor="curEmail" className="block mb-1 font-semibold">
                                Current Email:
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={adminData.adminEmail}
                                    readOnly
                                    className="flex-grow p-2 border border-gray-300 rounded"
                                />
                                <button
                                    type="button"
                                    onClick={toggleEmailField}
                                    className="w-1/4 bg-gray-800 text-white p-2 rounded hover:bg-gray-700 transition"
                                >
                                    {showEmailField ? "Cancel" : "Edit"}
                                </button>
                            </div>
                        </div>

                        {showEmailField && (
                            <>
                                <div>
                                    <label
                                        htmlFor="newEmail"
                                        className="block mb-1 font-semibold"
                                    >
                                        Enter New Email:
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="email"
                                            name="newEmail"
                                            value={formData.newEmail}
                                            onChange={handleInputChange}
                                            className="flex-grow p-2 border border-gray-300 rounded"
                                            required
                                            readOnly={otpVerified}
                                        />
                                        <button
                                            type="button"
                                            onClick={sendAdminOtp}
                                            disabled={otpCountdown > 0 || otpVerified}
                                            className={`w-1/4 p-2 rounded ${otpCountdown > 0 || otpVerified
                                                    ? "bg-gray-400"
                                                    : "bg-gray-800 hover:bg-gray-700"
                                                } text-white transition`}
                                        >
                                            {otpCountdown > 0
                                                ? `Resend in 0:${otpCountdown < 10 ? "0" : ""
                                                }${otpCountdown}`
                                                : otpVerified
                                                    ? "OTP Sent"
                                                    : "Send OTP"}
                                        </button>
                                    </div>
                                </div>

                                {showOtpField && (
                                    <div>
                                        <label htmlFor="otp" className="block mb-1 font-semibold">
                                            Enter OTP:
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                name="otp"
                                                value={formData.otp}
                                                onChange={handleInputChange}
                                                className="flex-grow p-2 border border-gray-300 rounded"
                                                readOnly={otpVerified}
                                            />
                                            <button
                                                type="button"
                                                onClick={validateAdminOtp}
                                                disabled={otpVerified}
                                                className={`w-1/4 p-2 rounded ${otpVerified
                                                        ? "bg-green-600"
                                                        : "bg-gray-800 hover:bg-gray-700"
                                                    } text-white transition`}
                                            >
                                                {otpVerified ? "Verified" : "Verify"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <button
                            type="button"
                            onClick={updateCredentials}
                            className="w-full bg-gray-800 text-white p-2 rounded hover:bg-gray-700 transition mt-6"
                        >
                            Update
                        </button>

                        {showInstituteOtpField && (
                            <>
                                <label
                                    htmlFor="instituteOtp"
                                    className="block mt-6 mb-1 font-semibold"
                                >
                                    Enter Institute OTP:
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        name="instituteOtp"
                                        value={formData.instituteOtp}
                                        onChange={handleInputChange}
                                        className="flex-grow p-2 border border-gray-300 rounded"
                                        readOnly={instituteOtpVerified}
                                    />
                                    <button
                                        type="button"
                                        onClick={validateInstituteOtp}
                                        disabled={instituteOtpVerified}
                                        className={`w-1/4 p-2 rounded ${instituteOtpVerified
                                                ? "bg-green-600"
                                                : "bg-gray-800 hover:bg-gray-700"
                                            } text-white transition`}
                                    >
                                        {instituteOtpVerified ? "Verified" : "Verify"}
                                    </button>
                                </div>
                            </>
                        )}

                        {showConfirmation && (
                            <div className="flex gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={confirmChanges}
                                    className="flex-1 bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
                                >
                                    Confirm update
                                </button>
                                <button
                                    type="button"
                                    onClick={cancelChanges}
                                    className="flex-1 bg-red-600 text-white p-2 rounded hover:bg-red-700 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </main>
        </div>
    );
};

export default AdminCredentials;
