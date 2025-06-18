import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaCheck,
  FaEnvelope,
  FaLock,
  FaUser,
  FaIdCard,
  FaPhone,
  FaUniversity,
  FaCamera,
  FaSpinner,
  FaRedo,
  FaMapMarkerAlt,
  FaUserTie,
} from "react-icons/fa";
import { checkEmailUsed, sendOtp, verifyOtp } from "../routes/authRoutes";
import { instituteSignup } from "../routes/insRoutes";

const InstituteSignUp = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    insName: "",
    insCode: "",
    insMob: "",
    insMail: "",
    insAddress: "",
    adName: "",
    adMob: "",
    adMail: "",
    photo: null,
    pass: "",
    CNFpass: "",
    insOTP: "",
    adOTP: "",
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [insOTPSent, setInsOTPSent] = useState(false);
  const [adOTPSent, setAdOTPSent] = useState(false);
  const [insVerified, setInsVerified] = useState(false);
  const [adVerified, setAdVerified] = useState(false);
  const [insResendTime, setInsResendTime] = useState(0);
  const [adResendTime, setAdResendTime] = useState(0);
  const [showPassword, setShowPassword] = useState({
    pass: false,
    CNFpass: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      setFormData({ ...formData, [name]: files[0] });
      if (files && files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewImage(e.target.result);
        };
        reader.readAsDataURL(files[0]);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const nextStep = async (e) => {
    e.preventDefault();
    const {
      insName,
      insCode,
      insMob,
      insMail,
      insAddress,
      adName,
      adMob,
      adMail,
    } = formData;

    if (
      !insName ||
      !insCode ||
      !insMob ||
      !insMail ||
      !insAddress ||
      !adName ||
      !adMail ||
      !adMob
    ) {
      toast.error("Please fill all fields");
      return;
    }

    if (insMail === adMail) {
      toast.error("Institute Email and Admin Email should be different!");
      return;
    }

    if (insMob === adMob) {
      toast.error("Institute Mobile and Admin Mobile should be different!");
      return;
    }

    try {
      const [response1, response2] = await Promise.all([
        checkEmailUsed(insMail),
        checkEmailUsed(adMail),
      ]);

      if (response1.success) return toast.error("Institute email is in use!");
      if (response2.success) return toast.error("Admin email is in use!");

      setCurrentStep(2);
    } catch (error) {
      console.error("Error checking emails:", error);
      toast.error("Error checking email availability");
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
    setInsOTPSent(false);
    setAdOTPSent(false);
    setFormData({
      ...formData,
      insOTP: "",
      adOTP: "",
    });
    setInsResendTime(0);
    setAdResendTime(0);
    setInsVerified(false);
    setAdVerified(false);
  };

  const sendOTP1 = async () => {
    try {
      startResendTimer("ins");
      setInsOTPSent(true);
      const res = await sendOtp(formData.insMail);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP");
    }
  };

  const sendOTP2 = async () => {
    try {
      startResendTimer("ad");
      setAdOTPSent(true);
      const res = await sendOtp(formData.adMail);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP");
    }
  };

  const startResendTimer = (type) => {
    const setTimer = type === "ins" ? setInsResendTime : setAdResendTime;
    setTimer(59);

    const timer = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const validateInsOTP = async () => {
    try {
      const res = await verifyOtp(formData.insMail, formData.insOTP);
      if (res.success) {
        toast.success(res.message);
        setInsVerified(true);
        setInsResendTime(0);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Failed to verify OTP");
    }
  };

  const validateAdOTP = async () => {
    try {
      const res = await verifyOtp(formData.adMail, formData.adOTP);
      if (res.success) {
        toast.success(res.message);
        setAdVerified(true);
        setAdResendTime(0);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Failed to verify OTP");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { photo, pass, CNFpass, insOTP, adOTP } = formData;

    if (!photo || !pass || !CNFpass) {
      toast.error("Please fill in all the required fields.");
      return;
    }

    if (pass !== CNFpass) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!insVerified || !adVerified) {
      toast.error("Please verify your emails before signing up.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await instituteSignup(formData);
      if (result.success) {
        toast.success("Signup successful! Redirecting to login...");
        setTimeout(() => {
          navigate("/instituteLogin");
        }, 3000);
      } else {
        toast.error(result.message || "Signup failed!");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Signup failed!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white text-center">
          <h1 className="text-2xl md:text-3xl font-bold">
            Institute Registration
          </h1>
          <div className="flex justify-center mt-4">
            <div
              className={`h-2 rounded-full mx-1 w-1/4 ${
                currentStep === 1 ? "bg-white" : "bg-indigo-400"
              }`}
            ></div>
            <div
              className={`h-2 rounded-full mx-1 w-1/4 ${
                currentStep === 2 ? "bg-white" : "bg-indigo-400"
              }`}
            ></div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <form onSubmit={currentStep === 1 ? nextStep : handleSubmit}>
            {currentStep === 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Institute Information */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-indigo-700 border-b pb-2 flex items-center">
                    <FaUniversity className="mr-2" /> Institute Information
                  </h2>

                  <div>
                    <label className="block text-gray-700 mb-1">
                      Institute Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="insName"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                        value={formData.insName}
                        onChange={handleChange}
                      />
                      <FaUniversity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">
                      Institute Code
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="insCode"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                        value={formData.insCode}
                        onChange={handleChange}
                      />
                      <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">
                      Contact Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="insMob"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                        value={formData.insMob}
                        onChange={handleChange}
                      />
                      <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Email ID</label>
                    <div className="relative">
                      <input
                        type="email"
                        name="insMail"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                        value={formData.insMail}
                        onChange={handleChange}
                      />
                      <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Address</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="insAddress"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                        value={formData.insAddress}
                        onChange={handleChange}
                      />
                      <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Admin Information */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-indigo-700 border-b pb-2 flex items-center">
                    <FaUserTie className="mr-2" /> Administrator Information
                  </h2>

                  <div>
                    <label className="block text-gray-700 mb-1">Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="adName"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                        value={formData.adName}
                        onChange={handleChange}
                      />
                      <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="adMob"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                        value={formData.adMob}
                        onChange={handleChange}
                      />
                      <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Email ID</label>
                    <div className="relative">
                      <input
                        type="email"
                        name="adMail"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                        value={formData.adMail}
                        onChange={handleChange}
                      />
                      <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Documents and Verification */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-indigo-700 border-b pb-2 flex items-center">
                      <FaCamera className="mr-2" /> Upload Documents
                    </h2>

                    {previewImage && (
                      <div className="flex justify-center">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="max-w-[200px] rounded-lg border-2 border-indigo-100"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-gray-700 mb-1">
                        Passport Photo
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          name="photo"
                          accept="image/jpeg"
                          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          onChange={handleChange}
                          required
                        />
                        <FaCamera className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-1">
                        Create Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.pass ? "text" : "password"}
                          name="pass"
                          className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="Password"
                          required
                          value={formData.pass}
                          onChange={handleChange}
                        />
                        <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600"
                          onClick={() =>
                            setShowPassword({
                              ...showPassword,
                              pass: !showPassword.pass,
                            })
                          }
                        >
                          {showPassword.pass ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.CNFpass ? "text" : "password"}
                          name="CNFpass"
                          className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="Confirm Password"
                          required
                          value={formData.CNFpass}
                          onChange={handleChange}
                        />
                        <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600"
                          onClick={() =>
                            setShowPassword({
                              ...showPassword,
                              CNFpass: !showPassword.CNFpass,
                            })
                          }
                        >
                          {showPassword.CNFpass ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {formData.pass && formData.CNFpass && (
                        <p
                          className={`text-sm mt-1 ${
                            formData.pass === formData.CNFpass
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {formData.pass === formData.CNFpass
                            ? "Passwords match"
                            : "Passwords do not match"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-indigo-700 border-b pb-2 flex items-center">
                      <FaEnvelope className="mr-2" /> Email Verification
                    </h2>

                    <div>
                      <label className="block text-gray-700 mb-1">
                        Institute Email
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-grow">
                          <input
                            type="email"
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            readOnly
                            value={formData.insMail}
                          />
                          <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                        <button
                          type="button"
                          className={`px-4 py-2 rounded-lg flex items-center ${
                            insResendTime > 0 || insVerified
                              ? "bg-gray-400"
                              : "bg-indigo-600 hover:bg-indigo-700"
                          } text-white transition`}
                          onClick={sendOTP1}
                          disabled={insResendTime > 0 || insVerified}
                        >
                          {insResendTime > 0 ? (
                            <>
                              <FaRedo className="mr-2 animate-spin" />
                              {`0:${
                                insResendTime < 10 ? "0" : ""
                              }${insResendTime}`}
                            </>
                          ) : insVerified ? (
                            "Verified"
                          ) : (
                            "Send OTP"
                          )}
                        </button>
                      </div>
                    </div>

                    {insOTPSent && (
                      <div>
                        <label className="block text-gray-700 mb-1">
                          Enter OTP
                        </label>
                        <div className="flex gap-2">
                          <div className="relative flex-grow">
                            <input
                              type="text"
                              name="insOTP"
                              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                                insVerified ? "bg-green-50" : ""
                              }`}
                              value={formData.insOTP}
                              onChange={handleChange}
                              disabled={insVerified}
                              placeholder="Enter 6-digit OTP"
                            />
                            <FaCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          </div>
                          <button
                            type="button"
                            className={`px-4 py-2 rounded-lg flex items-center ${
                              insVerified
                                ? "bg-green-500"
                                : "bg-indigo-600 hover:bg-indigo-700"
                            } text-white transition`}
                            onClick={validateInsOTP}
                            disabled={insVerified}
                          >
                            {insVerified ? "Verified" : "Verify"}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="pt-4">
                      <label className="block text-gray-700 mb-1">
                        Admin Email
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-grow">
                          <input
                            type="email"
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            readOnly
                            value={formData.adMail}
                          />
                          <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                        <button
                          type="button"
                          className={`px-4 py-2 rounded-lg flex items-center ${
                            adResendTime > 0 || adVerified
                              ? "bg-gray-400"
                              : "bg-indigo-600 hover:bg-indigo-700"
                          } text-white transition`}
                          onClick={sendOTP2}
                          disabled={adResendTime > 0 || adVerified}
                        >
                          {adResendTime > 0 ? (
                            <>
                              <FaRedo className="mr-2 animate-spin" />
                              {`0:${
                                adResendTime < 10 ? "0" : ""
                              }${adResendTime}`}
                            </>
                          ) : adVerified ? (
                            "Verified"
                          ) : (
                            "Send OTP"
                          )}
                        </button>
                      </div>
                    </div>

                    {adOTPSent && (
                      <div>
                        <label className="block text-gray-700 mb-1">
                          Enter OTP
                        </label>
                        <div className="flex gap-2">
                          <div className="relative flex-grow">
                            <input
                              type="text"
                              name="adOTP"
                              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                                adVerified ? "bg-green-50" : ""
                              }`}
                              value={formData.adOTP}
                              onChange={handleChange}
                              disabled={adVerified}
                              placeholder="Enter 6-digit OTP"
                            />
                            <FaCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          </div>
                          <button
                            type="button"
                            className={`px-4 py-2 rounded-lg flex items-center ${
                              adVerified
                                ? "bg-green-500"
                                : "bg-indigo-600 hover:bg-indigo-700"
                            } text-white transition`}
                            onClick={validateAdOTP}
                            disabled={adVerified}
                          >
                            {adVerified ? "Verified" : "Verify"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-between">
              {currentStep === 2 && (
                <button
                  type="button"
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition flex items-center disabled:opacity-50"
                  onClick={prevStep}
                  disabled={isSubmitting}
                >
                  <FaArrowLeft className="mr-2" /> Back
                </button>
              )}

              <button
                type="submit"
                className={`px-6 py-2 rounded-lg text-white transition flex items-center ml-auto ${
                  currentStep === 1
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-green-500 hover:bg-green-600"
                } disabled:opacity-70`}
                disabled={
                  isSubmitting ||
                  (currentStep === 2 && (!insVerified || !adVerified))
                }
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    {currentStep === 1 ? "Continue" : "Complete Registration"}
                    {currentStep === 2 && <FaCheck className="ml-2" />}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InstituteSignUp;
