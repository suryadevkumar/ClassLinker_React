import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaSearch, FaUsers, FaEye, FaFilter } from "react-icons/fa";
import {
  getClasses,
  getCourses,
  getDepartments,
  getStudentList,
} from "../routes/adminRoutes";
import StudentDetails from "./StudentDetails";

const StudentList = () => {
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Load departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const response = await getDepartments();
        setDepartments(response);
      } catch (error) {
        toast.error("Failed to load departments");
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  // Fetch courses when department is selected
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
        toast.error("Error loading courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [selectedDepartment]);

  // Fetch classes when course is selected
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
        toast.error("Error loading classes");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [selectedCourse]);

  // Filter students based on search term
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(
        (student) =>
          student[1].toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
          student[2].toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  // Load student list
  const loadStudentList = async () => {
    if (!selectedDepartment || !selectedCourse || !selectedClass) {
      toast.error("Please select department, course and class");
      return;
    }
    setLoading(true);
    try {
      const response = await getStudentList(
        selectedDepartment,
        selectedCourse,
        selectedClass
      );
      setStudents(response);
      setFilteredStudents(response);
      setSearchTerm("");
    } catch (error) {
      toast.error("Error loading student list");
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudent = (studentId) => {
    setSelectedStudentId(studentId);
  };

  const handleStudentUpdate = (updatedStudent) => {
    setStudents(
      students.map((s) =>
        s[0] === updatedStudent.STD_ID
          ? [
              updatedStudent.STD_ID,
              updatedStudent.STD_NAME,
              updatedStudent.DEPT_NAME || s[2],
              updatedStudent.COURSE_NAME || s[3],
              s[4],
            ]
          : s
      )
    );

    setFilteredStudents(
      filteredStudents.map((s) =>
        s[0] === updatedStudent.STD_ID
          ? [
              updatedStudent.STD_ID,
              updatedStudent.STD_NAME,
              updatedStudent.DEPT_NAME || s[2],
              updatedStudent.COURSE_NAME || s[3],
              s[4],
            ]
          : s
      )
    );

    setSelectedStudentId(null);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-800">Student Management</h1>
          <p className="text-indigo-600 mt-2">View and manage student records</p>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <FaFilter className="text-indigo-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Filter Students</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept[0]} value={dept[0]}>
                    {dept[1]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={!selectedDepartment || loading}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={!selectedCourse || loading}
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls[0]} value={cls[0]}>
                    {cls[1]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={loadStudentList}
                disabled={loading || !selectedDepartment || !selectedCourse || !selectedClass}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  <>
                    <FaUsers className="mr-2" />
                    View Students
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Student List Section */}
        {students.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div className="flex items-center mb-4 md:mb-0">
                  <FaUsers className="text-indigo-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-800">Student List</h2>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name or ID..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full md:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No students found matching your criteria</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-indigo-600">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Scholar ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Course
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Year
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStudents.map((student, index) => (
                        <tr key={index} className="hover:bg-indigo-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student[1]}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student[2]}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student[3]}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student[4]}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student[5]}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <button
                              onClick={() => handleViewStudent(student[0])}
                              className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors flex items-center"
                            >
                              <FaEye className="mr-1" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedStudentId && (
          <StudentDetails
            studentId={selectedStudentId}
            onClose={() => setSelectedStudentId(null)}
            onUpdate={handleStudentUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default StudentList;