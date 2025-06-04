import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getClasses,
  getCourses,
  getDepartments,
  getStudentList,
} from "../routes/adminRoutes";

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

  // Load departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      const response = await getDepartments();
      setDepartments(response);
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
        console.error("Error loading courses:", error);
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
        console.error("Error loading classes:", error);
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
          student[0].toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
          student[1].toLowerCase().includes(searchTerm.toLowerCase())
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
      setSearchTerm(""); // Reset search term when new list loads
    } catch (error) {
      toast.error("Error loading student list");
      console.error("Error loading student list:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-amber-50 to-pink-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Select Student Details
          </h2>

          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
            <div className="flex-1">
              <label
                htmlFor="department"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Department
              </label>
              <select
                id="department"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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

            <div className="flex-1">
              <label
                htmlFor="course"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Course
              </label>
              <select
                id="course"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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

            <div className="flex-1">
              <label
                htmlFor="class"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Class
              </label>
              <select
                id="class"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                disabled={
                  loading ||
                  !selectedDepartment ||
                  !selectedCourse ||
                  !selectedClass
                }
                className="px-4 py-2 mt-6 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Loading..." : "View List"}
              </button>
            </div>
          </div>
        </div>

        {/* Student List Section */}
        {students.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Student List
              </h2>
              <div className="mt-4 md:mt-0">
                <input
                  type="text"
                  placeholder="Search by name or scholar ID"
                  className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                No any student found
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-orange-500">
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
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student[0]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                          <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
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
        )}
      </div>
    </div>
  );
};

export default StudentList;