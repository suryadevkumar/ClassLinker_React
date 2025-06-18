import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { FaPlus, FaEdit, FaTrash, FaChalkboardTeacher, FaBook, FaTimes, FaCheck } from "react-icons/fa";
import {
  addSubject,
  deleteSubject,
  getClassDetails,
  getSubjectList,
  getTeacherList,
  updateSubject,
} from "../routes/adminRoutes";

const SubjectList = () => {
  const [classDetails, setClassDetails] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formData, setFormData] = useState({
    subjectName: "",
    teacherId: "",
  });
  const [editFormData, setEditFormData] = useState({
    subjectId: "",
    subjectName: "",
    teacherId: "",
  });
  const [subjectToDelete, setSubjectToDelete] = useState("");
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const idcc_id = location.state?.idcc_id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [details, subjectList, teacherList] = await Promise.all([
          getClassDetails(idcc_id),
          getSubjectList(idcc_id),
          getTeacherList()
        ]);
        setClassDetails(details);
        setSubjects(subjectList);
        setTeachers(teacherList);
      } catch (error) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [idcc_id]);

  const handleAddSubject = () => {
    setFormData({
      subjectName: "",
      teacherId: "",
    });
    setShowAddModal(true);
  };

  const handleEditSubject = (subjectId, subjectName, teacherId) => {
    setEditFormData({
      subjectId,
      subjectName,
      teacherId: teacherId || "",
    });
    setShowEditModal(true);
  };

  const handleDeleteSubject = (subjectId) => {
    setSubjectToDelete(subjectId);
    setShowConfirmModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subjectName) {
      toast.error("Please enter subject name");
      return;
    }

    try {
      const response = await addSubject(
        idcc_id,
        formData.subjectName,
        formData.teacherId || null
      );

      if (response.success) {
        const updatedSubjects = await getSubjectList(idcc_id);
        setSubjects(updatedSubjects);
        setShowAddModal(false);
        toast.success("Subject added successfully");
      }
    } catch (error) {
      toast.error("Error adding subject");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editFormData.subjectName) {
      toast.error("Please enter subject name");
      return;
    }

    try {
      const response = await updateSubject(
        editFormData.subjectId,
        editFormData.subjectName,
        editFormData.teacherId || null
      );

      if (response.success) {
        const updatedSubjects = await getSubjectList(idcc_id);
        setSubjects(updatedSubjects);
        setShowEditModal(false);
        toast.success("Subject updated successfully");
      }
    } catch (error) {
      toast.error("Error updating subject");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await deleteSubject(subjectToDelete);
      if (response.success) {
        const updatedSubjects = await getSubjectList(idcc_id);
        setSubjects(updatedSubjects);
        setShowConfirmModal(false);
        toast.success("Subject deleted successfully");
      }
    } catch (error) {
      toast.error("Error deleting subject");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-indigo-800">Loading subject data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-br from-blue-50 to-indigo-100 py-4">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-800">Subject Management</h1>
          <p className="text-indigo-600 mt-2">Manage subjects for this class</p>
        </div>

        {/* Class Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <FaBook className="mr-2 text-indigo-600" />
              Class Information
            </h2>
            <button
              onClick={handleAddSubject}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
            >
              <FaPlus className="mr-2" />
              Add Subject
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Department</p>
              <p className="text-lg font-semibold text-indigo-800">{classDetails[0]}</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Course</p>
              <p className="text-lg font-semibold text-indigo-800">{classDetails[1]}</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Class</p>
              <p className="text-lg font-semibold text-indigo-800">{classDetails[2]}</p>
            </div>
          </div>
        </div>

        {/* Subject List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FaBook className="mr-2 text-indigo-600" />
                Subject List
              </h2>
              <p className="text-gray-600">{subjects.length} subjects</p>
            </div>

            {subjects.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FaBook className="mx-auto text-4xl mb-4 text-gray-400" />
                <p>No subjects found for this class</p>
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
                        Subject Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Assigned Teacher
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subjects.map((subject, index) => (
                      <tr key={subject[0]} className="hover:bg-indigo-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {subject[1]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {subject[2] || "Not assigned"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 space-x-2">
                          <button
                            onClick={() => handleEditSubject(subject[0], subject[1], subject[3])}
                            className="px-3 py-1 mr-8 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors flex items-center float-left"
                          >
                            <FaEdit className="mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSubject(subject[0])}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center"
                          >
                            <FaTrash className="mr-1" />
                            Delete
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

        {/* Add Subject Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-indigo-800 flex items-center">
                    <FaPlus className="mr-2" />
                    Add New Subject
                  </h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject Name
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={formData.subjectName}
                      onChange={(e) =>
                        setFormData({ ...formData, subjectName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaChalkboardTeacher className="mr-2" />
                      Assign Teacher
                    </label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={formData.teacherId}
                      onChange={(e) =>
                        setFormData({ ...formData, teacherId: e.target.value })
                      }
                    >
                      <option value="">Select Teacher (Optional)</option>
                      {teachers.map((teacher) => (
                        <option key={teacher[0]} value={teacher[0]}>
                          {teacher[2]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <FaCheck className="mr-2" />
                      Add Subject
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Subject Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-indigo-800 flex items-center">
                    <FaEdit className="mr-2" />
                    Edit Subject
                  </h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>

                <form onSubmit={handleSave}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject Name
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={editFormData.subjectName}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          subjectName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaChalkboardTeacher className="mr-2" />
                      Assign Teacher
                    </label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={editFormData.teacherId}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          teacherId: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Teacher (Optional)</option>
                      {teachers.map((teacher) => (
                        <option key={teacher[0]} value={teacher[0]}>
                          {teacher[2]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <FaCheck className="mr-2" />
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Delete Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
              <div className="text-center">
                <FaTrash className="mx-auto text-4xl text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Subject</h3>
                <p className="text-gray-600 mb-6">Are you sure you want to delete this subject? This action cannot be undone.</p>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center"
                >
                  <FaTimes className="mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <FaTrash className="mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectList;