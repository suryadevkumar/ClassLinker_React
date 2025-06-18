import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash, FaArrowLeft, FaCheck, FaEnvelope, FaLock, FaUser, FaCalendarAlt, FaIdCard, FaPhone, FaUniversity, FaGraduationCap, FaChalkboardTeacher, FaUsers, FaCamera, FaFileUpload, FaRedo, FaSpinner } from "react-icons/fa";
import {
  getInstitute,
  getSections,
  studentSignup,
} from "../routes/studentRoutes";
import { checkEmailUsed, sendOtp, verifyOtp } from "../routes/authRoutes";
import { getClasses, getCourses, getDepartments } from "../routes/adminRoutes";

const StudentSignup = () => {
  // State management
  const [step, setStep] = useState(1);
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [formData, setFormData] = useState({
    stdName: "",
    stdDob: "",
    scholarId: "",
    stdMob: "",
    stdMail: "",
    college: "",
    department: "",
    course: "",
    cls: "",
    section: "",
    pass: "",
    CNFpass: "",
    stdOTP: "",
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
  const receiptInputRef = useRef(null);

  // Load colleges on component mount
  useEffect(() => {
    const loadColleges = async () => {
      try {
        const data = await getInstitute();
        setColleges(data);
      } catch (error) {
        console.error("Error loading colleges:", error);
        toast.error("Failed to load colleges");
      }
    };
    loadColleges();
  }, []);

  // Handle back button click
  const handleBack = () => {
    setStep(1);
    setOtpSent(false);
    setOtpVerified(false);
    setFormData({...formData, stdOTP: ""});
    setResendTimer(0);
  };

  // Handle college selection change
  const handleCollegeChange = async (e) => {
    const instId = e.target.value;
    setFormData({
      ...formData,
      college: instId,
      department: "",
      course: "",
      cls: "",
      section: "",
    });
    setDepartments([]);
    setCourses([]);
    setClasses([]);
    setSections([]);

    if (instId) {
      try {
        const data = await getDepartments(instId);
        setDepartments(data);
      } catch (error) {
        console.error("Error loading departments:", error);
        toast.error("Failed to load departments");
      }
    }
  };

  // Handle department selection change
  const handleDepartmentChange = async (e) => {
    const departmentId = e.target.value;
    setFormData({
      ...formData,
      department: departmentId,
      course: "",
      cls: "",
      section: "",
    });
    setCourses([]);
    setClasses([]);
    setSections([]);

    if (departmentId) {
      try {
        const data = await getCourses(departmentId);
        setCourses(data);
      } catch (error) {
        console.error("Error loading courses:", error);
        toast.error("Failed to load courses");
      }
    }
  };

  // Handle course selection change
  const handleCourseChange = async (e) => {
    const courseId = e.target.value;
    setFormData({ ...formData, course: courseId, cls: "", section: "" });
    setClasses([]);
    setSections([]);

    if (courseId) {
      try {
        const data = await getClasses(courseId);
        setClasses(data);
      } catch (error) {
        console.error("Error loading classes:", error);
        toast.error("Failed to load classes");
      }
    }
  };

  // Handle class selection change
  const handleClassChange = async (e) => {
    const clsId = e.target.value;
    setFormData({ ...formData, cls: clsId, section: "" });
    setSections([]);

    if (clsId) {
      try {
        const data = await getSections(clsId);
        setSections(data);
      } catch (error) {
        console.error("Error loading sections:", error);
        toast.error("Failed to load sections");
      }
    }
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
      if (!file.type.match("image.*")) {
        toast.error("Please upload an image file");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        // 2MB limit
        toast.error("Image size should be less than 2MB");
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
    const {
      stdName,
      stdDob,
      scholarId,
      stdMob,
      stdMail,
      college,
      department,
      course,
      cls,
      section,
    } = formData;

    // Validate all required fields
    if (
      !stdName ||
      !stdDob ||
      !scholarId ||
      !stdMob ||
      !stdMail ||
      !college ||
      !department ||
      !course ||
      !cls ||
      !section
    ) {
      toast.error("Please fill in all the required fields.");
      return;
    }

    try {
      const emailUsed = await checkEmailUsed(stdMail);
      if (emailUsed.success) {
        toast.error("Email is already in use!");
      } else {
        setStep(2);
      }
    } catch (error) {
      console.error("Error checking email:", error);
      toast.error("Error checking email availability");
    }
  };

  // Handle sending OTP
  const handleSendOTP = async () => {
    try {
      startResendTimer();
      setOtpSent(true);
      const response = await sendOtp(formData.stdMail);
      if (response.success) {
        toast.success("OTP sent successfully!");
      } else {
        toast.error(response.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP");
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async () => {
    if (!formData.stdOTP) {
      toast.error("Please enter OTP");
      return;
    }

    try {
      const response = await verifyOtp(formData.stdMail, formData.stdOTP);
      if (response.success) {
        toast.success("OTP verified successfully!");
        setOtpVerified(true);
      } else {
        toast.error(response.message || "Invalid OTP");
        setFormData({ ...formData, stdOTP: "" });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Failed to verify OTP");
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

    // Validate password match
    if (pass !== CNFpass) {
      toast.error("Passwords do not match.");
      return;
    }

    // Validate OTP verification
    if (!otpVerified) {
      toast.error("Please verify your email first.");
      return;
    }

    // Validate file uploads
    if (!fileInputRef.current.files[0] || !receiptInputRef.current.files[0]) {
      toast.error("Please upload both photo and receipt.");
      return;
    }

    setIsSubmitting(true);

    // Prepare form data for submission
    const formDataToSend = new FormData();
    formDataToSend.append("stdName", formData.stdName);
    formDataToSend.append("stdDob", formData.stdDob);
    formDataToSend.append("scholarId", formData.scholarId);
    formDataToSend.append("stdMob", formData.stdMob);
    formDataToSend.append("stdMail", formData.stdMail);
    formDataToSend.append("college", formData.college);
    formDataToSend.append("department", formData.department);
    formDataToSend.append("course", formData.course);
    formDataToSend.append("cls", formData.cls);
    formDataToSend.append("section", formData.section);
    formDataToSend.append("pass", formData.pass);
    formDataToSend.append("photo", fileInputRef.current.files[0]);
    formDataToSend.append("receipt", receiptInputRef.current.files[0]);

    try {
      const response = await studentSignup(formDataToSend);

      if (response.success) {
        toast.success("Signup successful. Redirecting to login...");
        setTimeout(() => {
          window.location.href = "/studentLogin";
        }, 3000);
      } else {
        toast.error(response.data?.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(
        error.response?.data?.message || "Signup failed. Please try again."
      );
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
            Student Registration
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
                        name="stdName"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={formData.stdName}
                        onChange={handleChange}
                        required
                      />
                      <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Date of Birth</label>
                    <div className="relative">
                      <input
                        type="date"
                        name="stdDob"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={formData.stdDob}
                        onChange={handleChange}
                        required
                      />
                      <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Scholar ID</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="scholarId"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={formData.scholarId}
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
                        name="stdMob"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={formData.stdMob}
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
                        name="stdMail"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={formData.stdMail}
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
                        onChange={handleCollegeChange}
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

                  <div>
                    <label className="block text-gray-700 mb-1">Department</label>
                    <div className="relative">
                      <select
                        name="department"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none disabled:bg-gray-50"
                        value={formData.department}
                        onChange={handleDepartmentChange}
                        required
                        disabled={!formData.college}
                      >
                        <option value="">Select Department</option>
                        {departments.map((department) => (
                          <option key={department[0]} value={department[0]}>
                            {department[1]}
                          </option>
                        ))}
                      </select>
                      <FaChalkboardTeacher className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Course</label>
                    <div className="relative">
                      <select
                        name="course"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none disabled:bg-gray-50"
                        value={formData.course}
                        onChange={handleCourseChange}
                        required
                        disabled={!formData.department}
                      >
                        <option value="">Select Course</option>
                        {courses.map((course) => (
                          <option key={course[0]} value={course[0]}>
                            {course[1]}
                          </option>
                        ))}
                      </select>
                      <FaGraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Class</label>
                    <div className="relative">
                      <select
                        name="cls"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none disabled:bg-gray-50"
                        value={formData.cls}
                        onChange={handleClassChange}
                        required
                        disabled={!formData.course}
                      >
                        <option value="">Select Class</option>
                        {classes.map((cls) => (
                          <option key={cls[0]} value={cls[0]}>
                            {cls[1]}
                          </option>
                        ))}
                      </select>
                      <FaChalkboardTeacher className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Section</label>
                    <div className="relative">
                      <select
                        name="section"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none disabled:bg-gray-50"
                        value={formData.section}
                        onChange={handleChange}
                        required
                        disabled={!formData.cls}
                      >
                        <option value="">Select Section</option>
                        {Array.from({ length: sections }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {`Section ${i + 1}`}
                          </option>
                        ))}
                      </select>
                      <FaUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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

                    <div>
                      <label className="block text-gray-700 mb-1">Admission Receipt</label>
                      <div className="relative">
                        <input
                          type="file"
                          name="receipt"
                          accept="image/*"
                          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          ref={receiptInputRef}
                          required
                        />
                        <FaFileUpload className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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
                            value={formData.stdMail}
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
                              name="stdOTP"
                              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              value={formData.stdOTP}
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
                  step === 1 
                    ? "bg-indigo-600 hover:bg-indigo-700" 
                    : "bg-green-500 hover:bg-green-600"
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

export default StudentSignup;