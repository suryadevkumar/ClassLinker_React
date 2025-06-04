import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
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
  const [passwordMatch, setPasswordMatch] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    // Check password match in real-time
    if (name === "pass" || name === "CNFpass") {
      if (formData.pass && formData.CNFpass) {
        setPasswordMatch(formData.pass === formData.CNFpass);
      } else {
        setPasswordMatch(null);
      }
    }
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
      const response = await sendOtp(formData.stdMail);
      if (response.success) {
        toast.success("OTP sent successfully!");
        setOtpSent(true);
        startResendTimer();
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
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-amber-50 to-pink-200 flex flex-col">
      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center py-8">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg mx-4 animate-slide-up">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Student Sign Up
          </h2>

          <form onSubmit={step === 1 ? handleNextStep : handleSubmit}>
            {step === 1 ? (
              <div className="space-y-4">
                {/* Personal Information Section */}
                <div>
                  <label className="block font-medium mb-1">Name:</label>
                  <input
                    type="text"
                    name="stdName"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-rose-300"
                    value={formData.stdName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">
                    Date of Birth:
                  </label>
                  <input
                    type="date"
                    name="stdDob"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-rose-300"
                    value={formData.stdDob}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Scholar ID:</label>
                  <input
                    type="text"
                    name="scholarId"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-rose-300"
                    value={formData.scholarId}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">
                    Mobile Number:
                  </label>
                  <input
                    type="text"
                    name="stdMob"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-rose-300"
                    value={formData.stdMob}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Email ID:</label>
                  <input
                    type="email"
                    name="stdMail"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-rose-300"
                    value={formData.stdMail}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Academic Information Section */}
                <div>
                  <label className="block font-medium mb-1">College:</label>
                  <select
                    name="college"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-rose-300"
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
                </div>

                <div>
                  <label className="block font-medium mb-1">Department:</label>
                  <select
                    name="department"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:bg-gray-100"
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
                </div>

                <div>
                  <label className="block font-medium mb-1">Course:</label>
                  <select
                    name="course"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:bg-gray-100"
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
                </div>

                <div>
                  <label className="block font-medium mb-1">Class:</label>
                  <select
                    name="cls"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:bg-gray-100"
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
                </div>

                <div>
                  <label className="block font-medium mb-1">Section:</label>
                  <select
                    name="section"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:bg-gray-100"
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
                </div>

                <button
                  type="submit"
                  className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition mt-6"
                >
                  Next
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Step 2 - Verification and Documents */}
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="max-w-[200px] mx-auto mb-4 rounded border"
                  />
                )}

                <div>
                  <label className="block font-medium mb-1">
                    Passport Size Photo:
                  </label>
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-rose-300"
                    onChange={handlePhotoUpload}
                    ref={fileInputRef}
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">
                    Admission Receipt:
                  </label>
                  <input
                    type="file"
                    name="receipt"
                    accept="image/*"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-rose-300"
                    ref={receiptInputRef}
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">
                    Create Password:
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="pass"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-rose-300 pr-10"
                      placeholder="Password"
                      value={formData.pass}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-medium mb-1">
                    Confirm Password:
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="CNFpass"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-rose-300 pr-10"
                      placeholder="Confirm Password"
                      value={formData.CNFpass}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-medium mb-1">
                    Verify your mail:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-grow px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-rose-300"
                      value={formData.stdMail}
                      readOnly
                    />
                    <button
                      type="button"
                      className={`px-4 py-2 rounded ${
                        resendTimer > 0
                          ? "bg-gray-400"
                          : "bg-green-500 hover:bg-green-600"
                      } text-white transition`}
                      onClick={handleSendOTP}
                      disabled={resendTimer > 0}
                    >
                      {resendTimer > 0
                        ? `Resend in 0:${
                            resendTimer < 10 ? "0" : ""
                          }${resendTimer}`
                        : "Send OTP"}
                    </button>
                  </div>
                </div>

                {otpSent && (
                  <>
                    <div>
                      <label className="block font-medium mb-1">
                        Enter OTP:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="stdOTP"
                          className="flex-grow px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-rose-300"
                          value={formData.stdOTP}
                          onChange={handleChange}
                          disabled={otpVerified}
                        />
                        <button
                          type="button"
                          className={`px-4 py-2 rounded ${
                            otpVerified
                              ? "bg-green-500"
                              : "bg-blue-500 hover:bg-blue-600"
                          } text-white transition`}
                          onClick={handleVerifyOTP}
                          disabled={otpVerified}
                        >
                          {otpVerified ? "Verified" : "Verify"}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-2 mt-6">
                  <button
                    type="submit"
                    className="flex-grow bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
                  >
                    Sign Up
                  </button>
                  <button
                    type="button"
                    className="flex-grow bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition"
                    onClick={() => setStep(1)}
                  >
                    Previous
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default StudentSignup;
