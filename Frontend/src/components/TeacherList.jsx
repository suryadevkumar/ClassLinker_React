import { useState, useEffect } from "react";
import { FaSearch, FaChalkboardTeacher, FaEye, FaUsersSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { getTeacherList } from "../routes/adminRoutes";
import TeacherDetails from "./TeacherDetails";

const TeacherList = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter teachers based on search term
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredTeachers(teachers);
    } else {
      const filtered = teachers.filter(
        (teacher) =>
          teacher[1].toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher[2].toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTeachers(filtered);
    }
  }, [searchTerm, teachers]);

  useEffect(() => {
    loadTeacherList();
  }, []);

  // Load teacher list
  const loadTeacherList = async () => {
    try {
      setLoading(true);
      const response = await getTeacherList();
      setTeachers(response);
      setFilteredTeachers(response);
      setSearchTerm("");
    } catch (error) {
      toast.error("Failed to load teacher list");
    } finally {
      setLoading(false);
    }
  };

  const handleViewTeacher = (teacherId) => {
    setSelectedTeacherId(teacherId);
  };

  const handleTeacherUpdate = (updatedTeacher) => {
    setTeachers(
      teachers.map((t) =>
        t[0] === updatedTeacher.TCH_ID
          ? [
              updatedTeacher.TCH_ID,
              updatedTeacher.TCH_NAME,
              updatedTeacher.DEP_NAME || t[2],
              updatedTeacher.CRS_NAME || t[3],
              t[4],
            ]
          : t
      )
    );

    setFilteredTeachers(
      filteredTeachers.map((t) =>
        t[0] === updatedTeacher.TCH_ID
          ? [
              updatedTeacher.TCH_ID,
              updatedTeacher.TCH_NAME,
              updatedTeacher.DEP_NAME || t[2],
              updatedTeacher.CRS_NAME || t[3],
              t[4],
            ]
          : t
      )
    );

    setSelectedTeacherId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-indigo-800">Loading teacher list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-800">Teacher Management</h1>
          <p className="text-indigo-600 mt-2">View and manage teacher records</p>
        </div>

        {/* Teacher List Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div className="flex items-center mb-4 md:mb-0">
                <FaChalkboardTeacher className="text-indigo-600 mr-2 text-xl" />
                <h2 className="text-xl font-semibold text-gray-800">Teacher List</h2>
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

            {teachers.length === 0 ? (
              <div className="text-center py-12">
                <FaUsersSlash className="mx-auto text-4xl text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-700">No Teachers Available</h3>
                <p className="text-gray-500 mt-2">There are currently no teachers registered in the system</p>
              </div>
            ) : filteredTeachers.length === 0 ? (
              <div className="text-center py-12">
                <FaSearch className="mx-auto text-4xl text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-700">No Matching Teachers Found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-indigo-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Teacher ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTeachers.map((teacher, index) => (
                      <tr key={index} className="hover:bg-indigo-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {teacher[1]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {teacher[2]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {teacher[3] || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <button
                            onClick={() => handleViewTeacher(teacher[0])}
                            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors flex items-center"
                          >
                            <FaEye className="mr-2" />
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

        {selectedTeacherId && (
          <TeacherDetails
            teacherId={selectedTeacherId}
            onClose={() => setSelectedTeacherId(null)}
            onUpdate={handleTeacherUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default TeacherList;