import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaSchool, FaGraduationCap, FaUsers, FaIdCard, FaEdit, FaTimes, FaSave, FaCheck, FaTimesCircle } from "react-icons/fa";
import {
  getStudentDetails,
  updateStudentDetails,
  getDepartments,
  getCourses,
  getClasses,
} from "../routes/adminRoutes";
import { getSections } from "../routes/studentRoutes";
import { jpgImg } from "../config/config";

const StudentDetails = ({ studentId, onClose }) => {
  const [student, setStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [docPreview, setDocPreview] = useState(null);

  // Dropdown data states
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sectionsCount, setSectionsCount] = useState(0);

  const [formData, setFormData] = useState({
    SCH_ID: "",
    STD_NAME: "",
    STD_DOB: "",
    STD_MOBILE: "",
    STD_EMAIL: "",
    SECTION: "",
    DEP_NAME: "",
    CRS_NAME: "",
    CLS_NAME: "",
    VERIFIED: "Unverified",
    DEP_ID: "",
    CRS_ID: "",
    CLS_ID: "",
  });

  // Load student details when component mounts or studentId changes
  useEffect(() => {
    fetchStudentDetails();
  }, [studentId]);

  const fetchStudentDetails = async () => {
    if (!studentId) return;

    setLoading(true);
    try {
      const response = await getStudentDetails(studentId);
      setStudent(response);

      // Format date for input field
      const dob = new Date(response.STD_DOB);
      const formattedDob = dob.toISOString().split("T")[0];

      setFormData({
        SCH_ID: response.SCH_ID,
        STD_NAME: response.STD_NAME,
        STD_DOB: formattedDob,
        STD_MOBILE: response.STD_MOBILE,
        STD_EMAIL: response.STD_EMAIL,
        SECTION: response.SECTION,
        DEP_NAME: response.DEP_NAME,
        CRS_NAME: response.CRS_NAME,
        CLS_NAME: response.CLS_NAME,
        VERIFIED: response.VERIFIED,
        DEP_ID: response.DEP_ID,
        CRS_ID: response.CRS_ID,
        CLS_ID: response.CLS_ID,
      });
    } catch (error) {
      toast.error("Failed to load student details");
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for loading dropdown data
  const loadCoursesForDepartment = async (departmentId) => {
    try {
      const data = await getCourses(departmentId);
      setCourses(data);
    } catch (error) {
      toast.error("Failed to load courses");
    }
  };

  const loadClassesForCourse = async (courseId) => {
    try {
      const data = await getClasses(courseId);
      setClasses(data);
    } catch (error) {
      toast.error("Failed to load classes");
    }
  };

  const loadSectionsForClass = async (classId) => {
    try {
      const data = await getSections(classId);
      setSectionsCount(data);
    } catch (error) {
      toast.error("Failed to load sections");
    }
  };

  // Handle department change
  const handleDepartmentChange = async (e) => {
    const departmentId = e.target.value;
    const selectedDept = departments.find((dept) => dept[0] == departmentId);

    setFormData({
      ...formData,
      DEP_ID: departmentId,
      DEP_NAME: selectedDept ? selectedDept[1] : "",
      CRS_ID: "",
      CRS_NAME: "",
      CLS_ID: "",
      CLS_NAME: "",
      SECTION: "",
    });

    setCourses([]);
    setClasses([]);
    setSectionsCount(0);

    if (departmentId) {
      await loadCoursesForDepartment(departmentId);
    }
  };

  // Handle course change
  const handleCourseChange = async (e) => {
    const courseId = e.target.value;
    const selectedCourse = courses.find((course) => course[0] == courseId);

    setFormData({
      ...formData,
      CRS_ID: courseId,
      CRS_NAME: selectedCourse ? selectedCourse[1] : "",
      CLS_ID: "",
      CLS_NAME: "",
      SECTION: "",
    });

    setClasses([]);
    setSectionsCount(0);

    if (courseId) {
      await loadClassesForCourse(courseId);
    }
  };

  // Handle class change
  const handleClassChange = async (e) => {
    const classId = e.target.value;
    const selectedClass = classes.find((cls) => cls[0] == classId);

    setFormData({
      ...formData,
      CLS_ID: classId,
      CLS_NAME: selectedClass ? selectedClass[1] : "",
      SECTION: "",
    });

    setSectionsCount(0);

    if (classId) {
      await loadSectionsForClass(classId);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (checked ? "Verified" : "Unverified") : value,
    });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    if (type === "profilePic") {
      setProfilePicPreview(previewUrl);
      setFormData(prev => ({ ...prev, STD_PIC: file }));
    } else if (type === "document") {
      setDocPreview(previewUrl);
      setFormData(prev => ({ ...prev, STD_DOC: file }));
    }
  };

  const handleImageClick = (imageData) => {
    if (!imageData) return;
    const newWindow = window.open();
    newWindow.document.write(
      `<img src="${imageData.startsWith("data:image") ? imageData : jpgImg + imageData}" 
       style="max-width: 100%; height: auto;" />`
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key !== "STD_PIC" && key !== "STD_DOC") {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (formData.STD_PIC) formDataToSend.append("STD_PIC", formData.STD_PIC);
      if (formData.STD_DOC) formDataToSend.append("STD_DOC", formData.STD_DOC);
      formDataToSend.append("stdId", student.STD_ID);

      const response = await updateStudentDetails(formDataToSend);
      if (response.success) {
        fetchStudentDetails();
        toast.success("Student updated successfully");
        setIsEditing(false);
      }
    } catch (error) {
      toast.error("Failed to update student");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = async () => {
    setIsEditing(true);
    setLoading(true);

    try {
      const depts = await getDepartments();
      setDepartments(depts);

      if (student.DEP_ID) {
        const crs = await getCourses(student.DEP_ID);
        setCourses(crs);

        if (student.CRS_ID) {
          const cls = await getClasses(student.CRS_ID);
          setClasses(cls);

          if (student.CLS_ID) {
            const sec = await getSections(student.CLS_ID);
            setSectionsCount(sec);
          }
        }
      }
    } catch (error) {
      toast.error("Failed to load dropdown data");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (student) {
      const dob = new Date(student.STD_DOB);
      const formattedDob = dob.toISOString().split("T")[0];

      setFormData({
        SCH_ID: student.SCH_ID,
        STD_NAME: student.STD_NAME,
        STD_DOB: formattedDob,
        STD_MOBILE: student.STD_MOBILE,
        STD_EMAIL: student.STD_EMAIL,
        SECTION: student.SECTION,
        DEP_NAME: student.DEP_NAME,
        CRS_NAME: student.CRS_NAME,
        CLS_NAME: student.CLS_NAME,
        VERIFIED: student.VERIFIED,
        DEP_ID: student.DEP_ID,
        CRS_ID: student.CRS_ID,
        CLS_ID: student.CLS_ID,
      });
    }
    setProfilePicPreview(null);
    setDocPreview(null);
    setCourses([]);
    setClasses([]);
    setSectionsCount(0);
  };

  if (loading && !student) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-700">Loading student details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-indigo-800">
                {isEditing ? "Edit Student Details" : "Student Details"}
              </h2>
              <p className="text-indigo-600">
                {student.SCH_ID} - {student.STD_NAME}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Profile Picture */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-48 h-48 rounded-full bg-indigo-50 mb-4 overflow-hidden border-4 border-indigo-100 cursor-pointer shadow-md"
                    onClick={() => handleImageClick(profilePicPreview || jpgImg + student.STD_PIC)}
                  >
                    <img
                      src={profilePicPreview || jpgImg + student.STD_PIC}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {isEditing && (
                    <label className="cursor-pointer bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 transition-colors flex items-center">
                      <FaEdit className="mr-2" />
                      Change Photo
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "profilePic")}
                      />
                    </label>
                  )}
                  
                  <div className="flex items-center mt-4">
                    <span className="text-sm font-medium text-gray-700 mr-3">Status:</span>
                    {isEditing ? (
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="VERIFIED"
                          checked={formData.VERIFIED === "Verified"}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className={`relative w-11 h-6 rounded-full peer ${formData.VERIFIED === "Verified" ? 'bg-green-500' : 'bg-gray-300'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          {formData.VERIFIED}
                        </span>
                      </label>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
                        student.VERIFIED === "Verified"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {student.VERIFIED === "Verified" ? (
                          <FaCheck className="mr-1" />
                        ) : (
                          <FaTimesCircle className="mr-1" />
                        )}
                        {student.VERIFIED}
                      </span>
                    )}
                  </div>
                </div>

                {/* Basic Information */}
                <div className="bg-indigo-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center">
                    <FaUser className="mr-2" />
                    Basic Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Scholar ID</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="SCH_ID"
                          value={formData.SCH_ID}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                      ) : (
                        <div className="w-full p-3 bg-white border border-gray-300 rounded-lg">
                          {student.SCH_ID}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="STD_NAME"
                          value={formData.STD_NAME}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                      ) : (
                        <div className="w-full p-3 bg-white border border-gray-300 rounded-lg">
                          {student.STD_NAME}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      {isEditing ? (
                        <div className="relative">
                          <FaCalendarAlt className="absolute left-3 top-3.5 text-gray-400" />
                          <input
                            type="date"
                            name="STD_DOB"
                            value={formData.STD_DOB}
                            onChange={handleInputChange}
                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                          />
                        </div>
                      ) : (
                        <div className="w-full p-3 bg-white border border-gray-300 rounded-lg">
                          {new Date(student.STD_DOB).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-indigo-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center">
                    <FaEnvelope className="mr-2" />
                    Contact Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                      {isEditing ? (
                        <div className="relative">
                          <FaPhone className="absolute left-3 top-3.5 text-gray-400" />
                          <input
                            type="tel"
                            name="STD_MOBILE"
                            value={formData.STD_MOBILE}
                            onChange={handleInputChange}
                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                          />
                        </div>
                      ) : (
                        <div className="w-full p-3 bg-white border border-gray-300 rounded-lg">
                          {student.STD_MOBILE}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
                        <div className="w-full pl-10 p-3 bg-white border border-gray-300 rounded-lg">
                          {student.STD_EMAIL}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Academic Information */}
                <div className="bg-indigo-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center">
                    <FaSchool className="mr-2" />
                    Academic Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      {isEditing ? (
                        <div className="relative">
                          <FaGraduationCap className="absolute left-3 top-3.5 text-gray-400" />
                          <select
                            name="DEP_ID"
                            value={formData.DEP_ID}
                            onChange={handleDepartmentChange}
                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
                            required
                          >
                            <option value="">Select Department</option>
                            {departments.map((dept) => (
                              <option key={dept[0]} value={dept[0]}>
                                {dept[1]}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="w-full p-3 bg-white border border-gray-300 rounded-lg">
                          {student.DEP_NAME}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                      {isEditing ? (
                        <div className="relative">
                          <FaGraduationCap className="absolute left-3 top-3.5 text-gray-400" />
                          <select
                            name="CRS_ID"
                            value={formData.CRS_ID}
                            onChange={handleCourseChange}
                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none disabled:bg-gray-100"
                            required
                            disabled={!formData.DEP_ID}
                          >
                            <option value="">Select Course</option>
                            {courses.map((course) => (
                              <option key={course[0]} value={course[0]}>
                                {course[1]}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="w-full p-3 bg-white border border-gray-300 rounded-lg">
                          {student.CRS_NAME}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                      {isEditing ? (
                        <div className="relative">
                          <FaUsers className="absolute left-3 top-3.5 text-gray-400" />
                          <select
                            name="CLS_ID"
                            value={formData.CLS_ID}
                            onChange={handleClassChange}
                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none disabled:bg-gray-100"
                            required
                            disabled={!formData.CRS_ID}
                          >
                            <option value="">Select Class</option>
                            {classes.map((cls) => (
                              <option key={cls[0]} value={cls[0]}>
                                {cls[1]}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="w-full p-3 bg-white border border-gray-300 rounded-lg">
                          {student.CLS_NAME || "Not Available"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                      {isEditing ? (
                        <div className="relative">
                          <FaUsers className="absolute left-3 top-3.5 text-gray-400" />
                          <select
                            name="SECTION"
                            value={formData.SECTION}
                            onChange={handleInputChange}
                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none disabled:bg-gray-100"
                            required
                            disabled={!formData.CLS_ID}
                          >
                            <option value="">Select Section</option>
                            {Array.from({ length: sectionsCount }, (_, i) => (
                              <option key={i + 1} value={i + 1}>
                                Section {i + 1}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="w-full p-3 bg-white border border-gray-300 rounded-lg">
                          {student.SECTION}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Document Section */}
                <div className="bg-indigo-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center">
                    <FaIdCard className="mr-2" />
                    Student Document
                  </h3>
                  
                  <div className="flex flex-col items-center">
                    <div
                      className="w-full max-w-xs cursor-pointer mb-4"
                      onClick={() => handleImageClick(docPreview || jpgImg + student.STD_DOC)}
                    >
                      <img
                        src={docPreview || jpgImg + student.STD_DOC}
                        alt="Student Document"
                        className="w-full h-auto border-2 border-gray-300 rounded-lg shadow-sm"
                      />
                    </div>
                    
                    {isEditing && (
                      <label className="cursor-pointer bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 transition-colors flex items-center">
                        <FaEdit className="mr-2" />
                        Change Document
                        <input
                          type="file"
                          className="hidden"
                          accept="application/pdf,image/*"
                          onChange={(e) => handleFileChange(e, "document")}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end space-x-4">
              {!isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleEditClick}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                  >
                    <FaEdit className="mr-2" />
                    Edit Details
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center"
                  >
                    <FaTimes className="mr-2" />
                    Close
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center"
                    disabled={loading}
                  >
                    <FaTimes className="mr-2" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;