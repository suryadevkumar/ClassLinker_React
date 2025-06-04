import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getClasses,
  getClassList,
  getCourses,
  getDepartments,
  addClass,
} from "../routes/adminRoutes";

const ClassList = () => {
  // State for main class list
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classList, setClassList] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  // State for add class modal
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [modalDepartment, setModalDepartment] = useState("");
  const [newDepartment, setNewDepartment] = useState("");
  const [modalCourse, setModalCourse] = useState("");
  const [newCourse, setNewCourse] = useState("");
  const [className, setClassName] = useState("");
  const [sectionNum, setSectionNum] = useState(1);
  const [showNewDeptInput, setShowNewDeptInput] = useState(false);
  const [showNewCourseInput, setShowNewCourseInput] = useState(false);
  const [showCourseSelect, setShowCourseSelect] = useState(false);
  const [modalCourses, setModalCourses] = useState([]);

  const navigate = useNavigate();

  // Load departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      const response = await getDepartments();
      setDepartments(response);
    };
    fetchDepartments();
  }, []);

  // Load courses when department is selected
  useEffect(() => {
    const fetchCourses = async () => {
      if (!selectedDepartment) {
        setCourses([]);
        setSelectedCourse("");
        setClasses([]);
        setSelectedClass("");
        return;
      }
      const response = await getCourses(selectedDepartment);
      setCourses(response);
      setSelectedCourse("");
      setClasses([]);
      setSelectedClass("");
    };
    fetchCourses();
  }, [selectedDepartment]);

  // Load classes when course is selected
  useEffect(() => {
    const fetchClasses = async () => {
      if (!selectedCourse) {
        setClasses([]);
        setSelectedClass("");
        return;
      }
      const response = await getClasses(selectedCourse);
      setClasses(response);
      setSelectedClass("");
    };
    fetchClasses();
  }, [selectedCourse]);

  // Load class list when filters change
  useEffect(() => {
    const fetchClassList = async () => {
      const response = await getClassList(
        selectedDepartment,
        selectedCourse,
        selectedClass
      );
      setClassList(response);
    };

    fetchClassList();
  }, [selectedDepartment, selectedCourse, selectedClass]);

  // Load courses for modal when department is selected
  useEffect(() => {
    const fetchModalCourses = async () => {
      if (!modalDepartment || modalDepartment === "addNew") {
        setShowCourseSelect(false);
        setModalCourses([]); // Clear modal courses
        return;
      }
      try {
        const data = await getCourses(modalDepartment);
        setModalCourses(data); // Store courses in modalCourses state
        setShowCourseSelect(true);
      } catch (error) {
        console.error("Error loading courses:", error);
      }
    };
    fetchModalCourses();
  }, [modalDepartment]);

  const toggleAddClassModal = () => {
    setShowAddClassModal(!showAddClassModal);
    // Reset modal state when opening
    if (!showAddClassModal) {
      setModalDepartment("");
      setNewDepartment("");
      setModalCourse("");
      setNewCourse("");
      setClassName("");
      setSectionNum(1);
      setShowNewDeptInput(false);
      setShowNewCourseInput(false);
      setShowCourseSelect(false);
      setModalCourses([]);
    }
  };

  const handleDepartmentChange = (e) => {
    const value = e.target.value;
    setModalDepartment(value);
    setShowNewDeptInput(value === "addNew");
    setShowCourseSelect(value !== "" && value !== "addNew");
    setModalCourse("");
    setNewCourse("");
    setShowNewCourseInput(false);
  };

  const handleCourseChange = (e) => {
    const value = e.target.value;
    setModalCourse(value);
    setShowNewCourseInput(value === "addNew");
  };

  const handleAddClass = async () => {
    // Validation (remains the same)
    if (!modalDepartment) {
      toast.error("Please Choose Department!");
      return;
    }
    if (modalDepartment === "addNew" && !newDepartment) {
      toast.error("Please Enter the Department Name!");
      return;
    }
    if (modalDepartment === "addNew" && !newCourse) {
      toast.error("Please Enter the Course Name!");
      return;
    }
    if (!modalCourse && !newCourse && modalDepartment !== "addNew") {
      toast.error("Please Choose Course!");
      return;
    }
    if (modalCourse === "addNew" && !newCourse) {
      toast.error("Please Enter the Course Name!");
      return;
    }
    if (!className) {
      toast.error("Please Enter the Class Name!");
      return;
    }
    if (!sectionNum || sectionNum < 1) {
      toast.error("Please Enter a valid Number of Sections!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append(
        "department",
        modalDepartment === "addNew" ? "addNew" : modalDepartment
      );
      formData.append("newDep", newDepartment);
      formData.append(
        "course",
        modalCourse === "addNew" ? "addNew" : modalCourse
      );
      formData.append("newCrs", newCourse);
      formData.append("className", className);
      formData.append("sectionNum", sectionNum);
      console.log(formData);
      const response = await addClass(formData);
      toast.success(response);
      toggleAddClassModal();

      // Refresh the class list
      const response1 = await getClasses(
        selectedDepartment,
        selectedCourse,
        selectedClass
      );
      setClassList(response1);
    } catch (error) {
      console.error("Error adding class:", error);
      alert("Failed to add class");
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-r from-amber-50 to-pink-200 py-8">
      <div className="container mx-auto px-4 flex flex-col items-center">
        {/* Admin Form */}
        <div className="bg-white p-8 rounded-lg shadow-md w-full lg:w-3/5 mb-8 animate-[slideIn_1s]">
          <h2 className="text-2xl font-bold mb-4">Select Class Details</h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-5">
            <select
              className="p-2 border border-gray-300 rounded-md w-full"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="">Select Department</option>
              {departments.map((department) => (
                <option key={department[0]} value={department[0]}>
                  {department[1]}
                </option>
              ))}
            </select>

            <select
              className="p-2 border border-gray-300 rounded-md w-full"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              disabled={!selectedDepartment}
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course[0]} value={course[0]}>
                  {course[1]}
                </option>
              ))}
            </select>

            <select
              className="p-2 border border-gray-300 rounded-md w-full"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={!selectedCourse}
            >
              <option value="">Select Class</option>
              {classes.map((classItem) => (
                <option key={classItem[0]} value={classItem[0]}>
                  {classItem[1]}
                </option>
              ))}
            </select>

            <button
              onClick={toggleAddClassModal}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors w-full whitespace-nowrap"
            >
              Add Class
            </button>
          </div>
        </div>

        {/* Class List */}
        <div className="w-full lg:w-3/5">
          {classList.map((item, index) => (
            <div
              key={index}
              className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-2 flex items-center"
            >
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-6">
                {index + 1}
              </div>
              <div className="flex-grow">
                <p>
                  <strong>Department:</strong> {item[0]}
                </p>
                <p>
                  <strong>Course:</strong> {item[1]}
                </p>
                <p>
                  <strong>Class:</strong> {item[2]}
                </p>
              </div>
              <Link
                to="/subject"
                state={{ idcc_id: item[3] }}
                className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md transition-colors ml-auto"
              >
                View
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Add Class Modal */}
      {showAddClassModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Add New Class
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block mb-1">Select Department:</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={modalDepartment}
                  onChange={handleDepartmentChange}
                >
                  <option value="">Select Department</option>
                  <option value="addNew">Add New Department</option>
                  {departments.map((department) => (
                    <option key={department[0]} value={department[0]}>
                      {department[1]}
                    </option>
                  ))}
                </select>
                {showNewDeptInput && (
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md mt-2"
                    placeholder="New Department Name"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                  />
                )}
              </div>

              {showCourseSelect && (
                <div>
                  <label className="block mb-1">Select Course:</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={modalCourse}
                    onChange={handleCourseChange}
                  >
                    <option value="">Select Course</option>
                    <option value="addNew">Add New Course</option>
                    {modalCourses.map((course) => (
                      <option key={course[0]} value={course[0]}>
                        {course[1]}
                      </option>
                    ))}
                  </select>
                  {showNewCourseInput && (
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md mt-2"
                      placeholder="New Course Name"
                      value={newCourse}
                      onChange={(e) => setNewCourse(e.target.value)}
                    />
                  )}
                </div>
              )}

              {!showCourseSelect && modalDepartment === "addNew" && (
                <div>
                  <label className="block mb-1">Course Name:</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="New Course Name"
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="block mb-1">Class Name:</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Class Name"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Number of Sections:</label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Sections"
                  min="1"
                  max="4"
                  value={sectionNum}
                  onChange={(e) => setSectionNum(parseInt(e.target.value) || 1)}
                  required
                />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={toggleAddClassModal}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddClass}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                Add Class
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ClassList;
