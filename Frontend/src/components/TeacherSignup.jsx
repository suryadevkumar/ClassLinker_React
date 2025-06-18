import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { 
  FaEye, FaEyeSlash, FaArrowLeft, FaCheck, FaEnvelope, FaLock, 
  FaUser, FaIdCard, FaPhone, FaUniversity, FaCamera, 
  FaSpinner, FaRedo
} from 'react-icons/fa';
import {submitTeacherSignup} from '../routes/teacherRoutes';
import { getInstitute } from '../routes/studentRoutes';
import { checkEmailUsed, sendOtp, verifyOtp } from '../routes/authRoutes';

const TeacherSignup = () => {
  // State management
  const [step, setStep] = useState(1);
  const [colleges, setColleges] = useState([]);
  const [formData, setFormData] = useState({
    tchName: '',
    tchCode: '',
    tchMob: '',
    tchMail: '',
    college: '',
    pass: '',
    CNFpass: '',
    tchOTP: '',
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for file inputs
  const fileInputRef = useRef(null);

  // Load colleges on component mount
  useEffect(() => {
    const loadColleges = async () => {
      try {
        const data = await getInstitute();
        setColleges(data);
      } catch (error) {
        console.error('Error loading colleges:', error);
        toast.error('Failed to load colleges');
      }
    };
    loadColleges();
  }, []);

  // Handle back button click
  const handleBack = () => {
    setStep(1);
    setOtpSent(false);
    setOtpVerified(false);
    setFormData({...formData, tchOTP: ''});
    setResendTimer(0);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle photo upload and preview
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.match('image.*')) {
        toast.error('Please upload an image file');
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error('Image size should be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle next step in form
  const handleNextStep = async (e) => {
    e.preventDefault();
    const { tchName, tchCode, tchMob, tchMail, college } = formData;

    // Validate all required fields
    if (!tchName || !tchCode || !tchMob || !tchMail || !college) {
      toast.error('Please fill in all the required fields.');
      return;
    }

    try {
      const response = await checkEmailUsed(tchMail);
      if (response.success) {
        toast.error('Email is already in use!');
      } else {
        setStep(2);
      }
    } catch (error) {
      console.error('Error checking email:', error);
      toast.error('Error checking email availability');
    }
  };

  // Handle sending OTP
  const handleSendOTP = async () => {
    try {
      startResendTimer();
      setOtpSent(true);
      const response = await sendOtp(formData.tchMail);
      if (response.success) {
        toast.success('OTP sent successfully!');
      } else {
        toast.error(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Failed to send OTP');
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async () => {
    if (!formData.tchOTP) {
      toast.error('Please enter OTP');
      return;
    }

    try {
      const response = await verifyOtp(formData.tchMail, formData.tchOTP);
      if (response.success) {
        toast.success('OTP verified successfully!');
        setOtpVerified(true);
      } else {
        toast.error(response.message || 'Invalid OTP');
        setFormData({ ...formData, tchOTP: '' });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Failed to verify OTP');
    }
  };

  // Timer for OTP resend
  const startResendTimer = () => {
    setResendTimer(59);
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { pass, CNFpass } = formData;

    // Validate file upload
    if (!fileInputRef.current.files[0]) {
      toast.error('Please upload your photo.');
      return;
    }

    // Validate password match
    if (pass !== CNFpass) {
      toast.error('Passwords do not match.');
      return;
    }

    // Validate OTP verification
    if (!otpVerified) {
      toast.error('Please verify your email first.');
      return;
    }

    setIsSubmitting(true);

    // Prepare form data for submission
    const formDataToSend = new FormData();
    formDataToSend.append('tchName', formData.tchName);
    formDataToSend.append('tchCode', formData.tchCode);
    formDataToSend.append('tchMob', formData.tchMob);
    formDataToSend.append('tchMail', formData.tchMail);
    formDataToSend.append('college', formData.college);
    formDataToSend.append('pass', formData.pass);
    formDataToSend.append('photo', fileInputRef.current.files[0]);

    try {
      const result = await submitTeacherSignup(formDataToSend);
      if (result === 'Signup Successful') {
        toast.success('Signup successful. Redirecting to login...');
        setTimeout(() => {
          window.location.href = '/teacherLogin';
        }, 2000);
      } else {
        toast.error(result || 'Signup failed');
      }
    } catch (error) {
      console.error('Error during signup:', error);
      toast.error('Signup failed. Please try again.');
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
            Teacher Registration
          </h1>
          <div className="flex justify-center mt-4">
            <div className={`h-2 rounded-full mx-1 w-1/4 ${step === 1 ? 'bg-white' : 'bg-indigo-400'}`}></div>
            <div className={`h-2 rounded-full mx-1 w-1/4 ${step === 2 ? 'bg-white' : 'bg-indigo-400'}`}></div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <form onSubmit={step === 1 ? handleNextStep : handleSubmit}>
            {step === 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-indigo-700 border-b pb-2 flex items-center">
                    <FaUser className="mr-2" /> Personal Information
                  </h2>
                  
                  <div>
                    <label className="block text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="tchName"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={formData.tchName}
                        onChange={handleChange}
                        required
                      />
                      <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Teacher ID</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="tchCode"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={formData.tchCode}
                        onChange={handleChange}
                        required
                      />
                      <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Mobile Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="tchMob"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={formData.tchMob}
                        onChange={handleChange}
                        required
                      />
                      <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Email ID</label>
                    <div className="relative">
                      <input
                        type="email"
                        name="tchMail"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={formData.tchMail}
                        onChange={handleChange}
                        required
                      />
                      <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-indigo-700 border-b pb-2 flex items-center">
                    <FaUniversity className="mr-2" /> Academic Information
                  </h2>

                  <div>
                    <label className="block text-gray-700 mb-1">College</label>
                    <div className="relative">
                      <select
                        name="college"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
                        value={formData.college}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select College</option>
                        {colleges.map((college) => (
                          <option key={college[0]} value={college[0]}>
                            {college[1]}
                          </option>
                        ))}
                      </select>
                      <FaUniversity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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

                    {photoPreview && (
                      <div className="flex justify-center">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="max-w-[200px] rounded-lg border-2 border-indigo-100"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-gray-700 mb-1">Passport Photo</label>
                      <div className="relative">
                        <input
                          type="file"
                          name="photo"
                          accept="image/*"
                          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          onChange={handlePhotoUpload}
                          ref={fileInputRef}
                          required
                        />
                        <FaCamera className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-indigo-700 border-b pb-2 flex items-center">
                      <FaLock className="mr-2" /> Account Security
                    </h2>

                    <div>
                      <label className="block text-gray-700 mb-1">Create Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="pass"
                          className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="Password"
                          value={formData.pass}
                          onChange={handleChange}
                          required
                        />
                        <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-1">Confirm Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="CNFpass"
                          className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="Confirm Password"
                          value={formData.CNFpass}
                          onChange={handleChange}
                          required
                        />
                        <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {formData.pass && formData.CNFpass && formData.CNFpass===formData.pass && (
                        <p className="text-green-500 text-sm mt-1">Passwords match</p>
                      )}
                      {formData.pass && formData.CNFpass && formData.CNFpass!==formData.pass &&(
                        <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-1">Email Verification</label>
                      <div className="flex gap-2">
                        <div className="relative flex-grow">
                          <input
                            type="email"
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            value={formData.tchMail}
                            readOnly
                          />
                          <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                        <button
                          type="button"
                          className={`px-4 py-2 rounded-lg flex items-center ${
                            resendTimer > 0
                              ? "bg-gray-400"
                              : "bg-indigo-600 hover:bg-indigo-700"
                          } text-white transition`}
                          onClick={handleSendOTP}
                          disabled={resendTimer > 0}
                        >
                          {resendTimer > 0 ? (
                            <>
                              <FaRedo className="mr-2 animate-spin" />
                              {`0:${resendTimer < 10 ? "0" : ""}${resendTimer}`}
                            </>
                          ) : (
                            "Send OTP"
                          )}
                        </button>
                      </div>
                    </div>

                    {otpSent && (
                      <div>
                        <label className="block text-gray-700 mb-1">Enter OTP</label>
                        <div className="flex gap-2">
                          <div className="relative flex-grow">
                            <input
                              type="text"
                              name="tchOTP"
                              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              value={formData.tchOTP}
                              onChange={handleChange}
                              disabled={otpVerified}
                              placeholder="Enter 6-digit OTP"
                            />
                            <FaCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          </div>
                          <button
                            type="button"
                            className={`px-4 py-2 rounded-lg flex items-center ${
                              otpVerified
                                ? "bg-green-500"
                                : "bg-indigo-600 hover:bg-indigo-700"
                            } text-white transition`}
                            onClick={handleVerifyOTP}
                            disabled={otpVerified}
                          >
                            {otpVerified ? "Verified" : "Verify"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-between">
              {step === 2 && (
                <button
                  type="button"
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition flex items-center disabled:opacity-50"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  <FaArrowLeft className="mr-2" /> Back
                </button>
              )}
              
              <button
                type="submit"
                className={`px-6 py-2 rounded-lg text-white transition flex items-center ml-auto ${
                  step === 1 ? "bg-indigo-600 hover:bg-indigo-700" : "bg-green-500 hover:bg-green-600"
                } disabled:opacity-70`}
                disabled={isSubmitting || (step === 2 && !otpVerified)}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    {step === 1 ? "Continue" : "Complete Registration"}
                    {step === 2 && <FaCheck className="ml-2" />}
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

export default TeacherSignup;