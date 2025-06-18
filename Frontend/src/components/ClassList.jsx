import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaPlus, FaUniversity, FaGraduationCap, FaUsers, FaTimes, FaCheck } from "react-icons/fa";
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
  const [loading, setLoading] = useState(true);

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
  const [processing, setProcessing] = useState(false);

  // Load departments on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const depts = await getDepartments();
        setDepartments(depts);
        const list = await getClassList("", "", "");
        setClassList(list);
      } catch (error) {
        toast.error("Failed to load class data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
      try {
        setLoading(true);
        const response = await getCourses(selectedDepartment);
        setCourses(response);
        setSelectedCourse("");
        setClasses([]);
        setSelectedClass("");
      } catch (error) {
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
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
      try {
        setLoading(true);
        const response = await getClasses(selectedCourse);
        setClasses(response);
        setSelectedClass("");
      } catch (error) {
        toast.error("Failed to load classes");
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [selectedCourse]);

  // Load class list when filters change
  useEffect(() => {
    const fetchClassList = async () => {
      try {
        setLoading(true);
        const response = await getClassList(
          selectedDepartment,
          selectedCourse,
          selectedClass
        );
        setClassList(response);
      } catch (error) {
        toast.error("Failed to load class list");
      } finally {
        setLoading(false);
      }
    };

    fetchClassList();
  }, [selectedDepartment, selectedCourse, selectedClass]);

  // Load courses for modal when department is selected
  useEffect(() => {
    const fetchModalCourses = async () => {
      if (!modalDepartment || modalDepartment === "addNew") {
        setShowCourseSelect(false);
        setModalCourses([]);
        return;
      }
      try {
        const data = await getCourses(modalDepartment);
        setModalCourses(data);
        setShowCourseSelect(true);
      } catch (error) {
        toast.error("Failed to load courses");
      }
    };
    fetchModalCourses();
  }, [modalDepartment]);

  const toggleAddClassModal = () => {
    setShowAddClassModal(!showAddClassModal);
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
    if (!modalDepartment) {
      toast.error("Please select a department");
      return;
    }
    if (modalDepartment === "addNew" && !newDepartment) {
      toast.error("Please enter department name");
      return;
    }
    if (modalDepartment === "addNew" && !newCourse) {
      toast.error("Please enter course name");
      return;
    }
    if (!modalCourse && !newCourse && modalDepartment !== "addNew") {
      toast.error("Please select a course");
      return;
    }
    if (modalCourse === "addNew" && !newCourse) {
      toast.error("Please enter course name");
      return;
    }
    if (!className) {
      toast.error("Please enter class name");
      return;
    }
    if (!sectionNum || sectionNum < 1) {
      toast.error("Please enter valid number of sections");
      return;
    }

    try {
      setProcessing(true);
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

      const response = await addClass(formData);
      toast.success(response);
      toggleAddClassModal();

      // Refresh the data
      const depts = await getDepartments();
      setDepartments(depts);
      const list = await getClassList(selectedDepartment, selectedCourse, selectedClass);
      setClassList(list);
    } catch (error) {
      toast.error("Failed to add class");
    } finally {
      setProcessing(false);
    }
  };

  if (loading && !classList.length) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-indigo-800">Loading class data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-br from-blue-50 to-indigo-100 py-4">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-800">Class Management</h1>
          <p className="text-indigo-600 mt-2">View and manage class information</p>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FaUniversity className="mr-2 text-indigo-600" />
            Filter Classes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((department) => (
                  <option key={department[0]} value={department[0]}>
                    {department[1]}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none disabled:bg-gray-100"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                disabled={!selectedDepartment}
              >
                <option value="">All Courses</option>
                {courses.map((course) => (
                  <option key={course[0]} value={course[0]}>
                    {course[1]}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none disabled:bg-gray-100"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                disabled={!selectedCourse}
              >
                <option value="">All Classes</option>
                {classes.map((classItem) => (
                  <option key={classItem[0]} value={classItem[0]}>
                    {classItem[1]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={toggleAddClassModal}
                className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center"
              >
                <FaPlus className="mr-2" />
                Add Class
              </button>
            </div>
          </div>
        </div>

        {/* Class List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FaUsers className="mr-2 text-indigo-600" />
                Class List
              </h2>
              <p className="text-gray-600">{classList.length} classes found</p>
            </div>

            {classList.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FaUsers className="mx-auto text-4xl mb-4 text-gray-400" />
                <p>No classes match your current filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-indigo-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {classList.map((item, index) => (
                      <tr key={index} className="hover:bg-indigo-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item[0]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item[1]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item[2]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <Link
                            to="/subject"
                            state={{ idcc_id: item[3] }}
                            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors inline-flex items-center"
                          >
                            View Subjects
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Add Class Modal */}
        {showAddClassModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-indigo-800 flex items-center">
                    <FaPlus className="mr-2" />
                    Add New Class
                  </h2>
                  <button
                    onClick={toggleAddClassModal}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
                      value={modalDepartment}
                      onChange={handleDepartmentChange}
                    >
                      <option value="">Select Department</option>
                      <option value="addNew">+ Add New Department</option>
                      {departments.map((department) => (
                        <option key={department[0]} value={department[0]}>
                          {department[1]}
                        </option>
                      ))}
                    </select>
                    {showNewDeptInput && (
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mt-2"
                        placeholder="Enter new department name"
                        value={newDepartment}
                        onChange={(e) => setNewDepartment(e.target.value)}
                      />
                    )}
                  </div>

                  {showCourseSelect && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Course
                      </label>
                      <select
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
                        value={modalCourse}
                        onChange={handleCourseChange}
                      >
                        <option value="">Select Course</option>
                        <option value="addNew">+ Add New Course</option>
                        {modalCourses.map((course) => (
                          <option key={course[0]} value={course[0]}>
                            {course[1]}
                          </option>
                        ))}
                      </select>
                      {showNewCourseInput && (
                        <input
                          type="text"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mt-2"
                          placeholder="Enter new course name"
                          value={newCourse}
                          onChange={(e) => setNewCourse(e.target.value)}
                        />
                      )}
                    </div>
                  )}

                  {!showCourseSelect && modalDepartment === "addNew" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Course Name
                      </label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter course name"
                        value={newCourse}
                        onChange={(e) => setNewCourse(e.target.value)}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class Name
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter class name"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Sections
                    </label>
                    <input
                      type="number"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="1-4"
                      min="1"
                      max="4"
                      value={sectionNum}
                      onChange={(e) => setSectionNum(parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    onClick={toggleAddClassModal}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center"
                  >
                    <FaTimes className="mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleAddClass}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaCheck className="mr-2" />
                        Add Class
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassList;