import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getStudentDetails,
  updateStudentDetails,
  getDepartments,
  getCourses,
  getClasses,
} from "../routes/adminRoutes";
import { getSections } from "../routes/studentRoutes";
import { jpgImg } from "../config/config";

const StudentDetails = ({ studentId, onClose, onUpdate }) => {
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
      console.error("Error loading student details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to load courses for a specific department
  const loadCoursesForDepartment = async (departmentId) => {
    try {
      const data = await getCourses(departmentId);
      setCourses(data);
    } catch (error) {
      console.error("Error loading courses:", error);
      toast.error("Failed to load courses");
    }
  };

  // Helper function to load classes for a specific course
  const loadClassesForCourse = async (courseId) => {
    try {
      const data = await getClasses(courseId);
      setClasses(data);
    } catch (error) {
      console.error("Error loading classes:", error);
      toast.error("Failed to load classes");
    }
  };

  // Helper function to load sections for a specific class
  const loadSectionsForClass = async (classId) => {
    try {
      const data = await getSections(classId);
      setSectionsCount(data);
    } catch (error) {
      console.error("Error loading sections:", error);
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
    if (name === "VERIFIED") {
      setFormData({
        ...formData,
        VERIFIED: checked ? "Verified" : "Unverified",
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === "profilePic") {
      setProfilePicPreview(URL.createObjectURL(file));
      setFormData((prev) => ({
        ...prev,
        STD_PIC: file,
      }));
    } else if (type === "document") {
      setDocPreview(URL.createObjectURL(file));
      setFormData((prev) => ({
        ...prev,
        STD_DOC: file,
      }));
    }
  };

  const handleImageClick = (imageData) => {
    if (!imageData) return;

    if (imageData.startsWith("data:image")) {
      const newWindow = window.open();
      newWindow.document.write(
        `<img src="${imageData}" style="max-width: 100%; height: auto;" />`
      );
    } else if (jpgImg) {
      const newWindow = window.open();
      newWindow.document.write(
        `<img src="${
          jpgImg + imageData
        }" style="max-width: 100%; height: auto;" />`
      );
    }
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

      if (formData.STD_PIC) {
        formDataToSend.append("STD_PIC", formData.STD_PIC);
      }
      if (formData.STD_DOC) {
        formDataToSend.append("STD_DOC", formData.STD_DOC);
      }

      formDataToSend.append("stdId", student.STD_ID);

      const response = await updateStudentDetails(formDataToSend);
      if (response.success) {
        fetchStudentDetails();

        toast.success("Student updated successfully");
        setIsEditing(false);
      }
    } catch (error) {
      toast.error("Failed to update student");
      console.error("Error updating student:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = async () => {
    setIsEditing(true);
    setLoading(true);

    try {
      // Load departments first
      const depts = await getDepartments();
      setDepartments(depts);

      // If student has a department, load courses
      if (student.DEP_ID) {
        const crs = await getCourses(student.DEP_ID);
        setCourses(crs);

        // If student has a course, load classes
        if (student.CRS_ID) {
          const cls = await getClasses(student.CRS_ID);
          setClasses(cls);

          // If student has a class, load sections
          if (student.CLS_ID) {
            const sec = await getSections(student.CLS_ID);
            setSectionsCount(sec);
          }
        }
      }
    } catch (error) {
      toast.error("Failed to load dropdown data");
      console.error("Error loading dropdown data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data to original student data
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
        STD_PIC: null, // Reset file fields
        STD_DOC: null,
      });
    }
    // Clear previews and reset dropdown states
    setProfilePicPreview(null);
    setDocPreview(null);
    setCourses([]);
    setClasses([]);
    setSectionsCount(0);
  };

  if (loading && !student) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-700">Loading student details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditing ? "Edit Student Details" : "Student Details"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Student Photo */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-64 h-64 rounded-full bg-gray-200 mb-2 overflow-hidden border-2 border-orange-300 cursor-pointer"
                    onClick={() =>
                      handleImageClick(
                        profilePicPreview || jpgImg + student.STD_PIC
                      )
                    }
                  >
                    <img
                      src={profilePicPreview || jpgImg + student.STD_PIC}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {isEditing && (
                    <label className="cursor-pointer bg-orange-100 text-orange-700 px-4 py-2 rounded-md hover:bg-orange-200 transition-colors">
                      Change Photo
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "profilePic")}
                      />
                    </label>
                  )}
                  <div className="flex items-center mt-2">
                    <label className="block text-sm font-medium text-gray-700 mr-4">
                      Status:
                    </label>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        name="VERIFIED"
                        checked={formData.VERIFIED === "Verified"}
                        onChange={handleInputChange}
                        className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                    ) : (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          student.VERIFIED === "Verified"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {student.VERIFIED}
                      </span>
                    )}
                  </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scholar ID
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="SCH_ID"
                        value={formData.SCH_ID}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                    ) : (
                      <input
                        type="text"
                        value={student.SCH_ID}
                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                        readOnly
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="STD_NAME"
                        value={formData.STD_NAME}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                    ) : (
                      <input
                        type="text"
                        value={student.STD_NAME}
                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                        readOnly
                      />
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          name="STD_DOB"
                          value={formData.STD_DOB}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          required
                        />
                      ) : (
                        <input
                          type="text"
                          value={new Date(student.STD_DOB).toLocaleDateString()}
                          className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                          readOnly
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mobile
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="STD_MOBILE"
                          value={formData.STD_MOBILE}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          required
                        />
                      ) : (
                        <input
                          type="text"
                          value={student.STD_MOBILE}
                          className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                          readOnly
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="text"
                        value={student.STD_EMAIL}
                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Academic Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Academic Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      {isEditing ? (
                        <select
                          name="DEP_ID"
                          value={formData.DEP_ID}
                          onChange={handleDepartmentChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          required
                        >
                          <option value="">Select Department</option>
                          {departments.map((department) => (
                            <option key={department[0]} value={department[0]}>
                              {department[1]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={student.DEP_NAME}
                          className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                          readOnly
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Course
                      </label>
                      {isEditing ? (
                        <select
                          name="CRS_ID"
                          value={formData.CRS_ID}
                          onChange={handleCourseChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
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
                      ) : (
                        <input
                          type="text"
                          value={student.CRS_NAME}
                          className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                          readOnly
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Class Name
                      </label>
                      {isEditing ? (
                        <select
                          name="CLS_ID"
                          value={formData.CLS_ID}
                          onChange={handleClassChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
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
                      ) : (
                        <input
                          type="text"
                          value={student.CLS_NAME || "Not Available"}
                          className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                          readOnly
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Section
                      </label>
                      {isEditing ? (
                        <select
                          name="SECTION"
                          value={formData.SECTION}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
                          required
                          disabled={!formData.CLS_ID}
                        >
                          <option value="">Select Section</option>
                          {Array.from({ length: sectionsCount }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {`Section ${i + 1}`}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={student.SECTION}
                          className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                          readOnly
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Document Preview */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Document
                  </h3>
                  <div>
                    <div
                      className="w-[100%] overflow-hidden cursor-pointer"
                      onClick={() =>
                        handleImageClick(docPreview || jpgImg + student.STD_DOC)
                      }
                    >
                      <img
                        src={docPreview || jpgImg + student.STD_DOC}
                        alt="Student Document"
                        className="w-[62%] h-auto border border-gray-500 p-1 rounded-md ml-20"
                      />
                    </div>
                    {isEditing && (
                      <label className="mt-2 ml-32 cursor-pointer bg-orange-100 text-orange-700 px-4 py-2 rounded-md hover:bg-orange-200 transition-colors inline-block">
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

            <div className="mt-6 flex justify-end space-x-3">
              {!isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleEditClick}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
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
