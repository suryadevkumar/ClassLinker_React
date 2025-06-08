import { useState, useEffect } from "react";
import { getTeacherList } from "../routes/adminRoutes";
import TeacherDetails from "./TeacherDetails";

const TeacherList = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);

  // Filter teachers based on search term
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredTeachers(teachers);
    } else {
      const filtered = teachers.filter(
        (teacher) =>
          teacher[1]
            .toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          teacher[2].toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTeachers(filtered);
    }
  }, [searchTerm, teachers]);

  useEffect(()=>{
    loadTeacherList();
  },[])

  // Load teacher list
  const loadTeacherList = async () => {
      const response = await getTeacherList();
      setTeachers(response);
      console.log(response)
      setFilteredTeachers(response);
      setSearchTerm("");
  };

  const handleViewTeacher = (teacherId) => {
    setSelectedTeacherId(teacherId);
  };

  const handleTeacherUpdate = (updatedTeacher) => {
    setTeachers(
      teachers.map((s) =>
        s[0] === updatedTeacher.STD_ID
          ? [
              updatedTeacher.STD_ID,
              updatedTeacher.STD_NAME,
              updatedTeacher.DEPT_NAME || s[2],
              updatedTeacher.COURSE_NAME || s[3],
              s[4],
            ]
          : s
      )
    );

    setFilteredTeachers(
      filteredTeachers.map((s) =>
        s[0] === updatedTeacher.STD_ID
          ? [
              updatedTeacher.STD_ID,
              updatedTeacher.STD_NAME,
              updatedTeacher.DEPT_NAME || s[2],
              updatedTeacher.COURSE_NAME || s[3],
              s[4],
            ]
          : s
      )
    );

    setSelectedTeacherId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-amber-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">

        {/* Teacher List Section */}
        {teachers.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Teacher List</h2>
              <div className="mt-4 md:mt-0">
                <input
                  type="text"
                  placeholder="Search by name or teacher ID"
                  className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {filteredTeachers.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                No any teacher found
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-orange-500">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Teacher ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-x">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTeachers.map((teacher, index) => (
                      <tr key={index} className="hover:bg-gray-50 border-b border-gray-300">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {teacher[1]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {teacher[2]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <button
                            onClick={() => handleViewTeacher(teacher[0])}
                            className="px-6 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
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
        ):
        (<div className="text-center text-2xl font-semibold mt-40">
          No any teacher available
        </div>)}

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
