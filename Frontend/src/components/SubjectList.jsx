import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
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
    teacherId: "invalid",
  });
  const [editFormData, setEditFormData] = useState({
    subjectId: "",
    subjectName: "",
    teacherId: "invalid",
  });
  const [subjectToDelete, setSubjectToDelete] = useState("");

  const location = useLocation();

  const idcc_id = location.state?.idcc_id;

  useEffect(() => {
    fetchClassDetails();
    fetchSubjectList();
    fetchTeacherList();
  }, []);

  const fetchClassDetails = async () => {
    const response = await getClassDetails(idcc_id);
    setClassDetails(response);
  };

  const fetchSubjectList = async () => {
    const response = await getSubjectList(idcc_id);
    setSubjects(response);
  };

  const fetchTeacherList = async () => {
    const response = await getTeacherList();
    setTeachers(response);
  };

  const handleAddSubject = () => {
    setFormData({
      subjectName: "",
      teacherId: "invalid",
    });
    setShowAddModal(true);
  };

  const handleEditSubject = (subjectId, subjectName, teacherId) => {
    setEditFormData({
      subjectId,
      subjectName,
      teacherId: teacherId || "invalid",
    });
    setShowEditModal(true);
  };

  const handleDeleteSubject = (subjectId) => {
    setSubjectToDelete(subjectId);
    setShowConfirmModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subjectName || formData.teacherId === "invalid") {
      toast.error("Please Enter Subject and Teacher Name");
      return;
    }

    const response = await addSubject(
      idcc_id,
      formData.subjectName,
      formData.teacherId
    );

    if (response.success) {
      fetchSubjectList();
      setShowAddModal(false);
      toast.success("Subject successfully added");
    } else {
      toast.error("Error adding subject");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!editFormData.subjectName || editFormData.teacherId === "invalid") {
      toast.error("Please Enter Subject and Teacher Name");
      return;
    }

    const response = await updateSubject(
      editFormData.subjectId,
      editFormData.subjectName,
      editFormData.teacherId
    );

    if (response.success) {
      fetchSubjectList();
      setShowEditModal(false);
      toast.success("Subject saved");
    } else {
      toast.error("Error updating subject");
    }
  };

  const handleDelete = async () => {
    const response = await deleteSubject(subjectToDelete);

    if (response.success) {
      fetchSubjectList();
      setShowConfirmModal(false);
      toast.success("Suject deletion successful");
    } else {
      toast.error("Error deleting subject");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-ffecd2 to-fcb69f flex flex-col">
      <section className="py-8 flex-grow">
        <div className="container mx-auto flex flex-col items-center">
          <div className="bg-white p-8 rounded-lg shadow-md w-full lg:w-3/5 animate-[slideIn_1s] relative">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold">Class Subject List</h2>
              <button
                onClick={handleAddSubject}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Add Subject
              </button>
            </div>
            <div className="mb-6">
              <p>
                <b>Department Name: </b>
                {classDetails[0]}
              </p>
              <p>
                <b>Course Name: </b>
                {classDetails[1]}
              </p>
              <p>
                <b>Class Name: </b>
                {classDetails[2]}
              </p>
            </div>
            <div className="w-full">
              <table className="w-full">
                <thead>
                  <tr className="bg-ff6f61 font-bold">
                    <th className="p-3 text-left">Sr.</th>
                    <th className="p-3 text-left">Subject Name</th>
                    <th className="p-3 text-left">Assigned Teacher</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject, index) => (
                    <tr key={subject[0]} className="hover:bg-gray-200 bg-gray-100 border-b-2 border-gray-300">
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3">{subject[1]}</td>
                      <td className="p-3">{subject[2] || ""}</td>
                      <td className="p-3">
                        <button
                          onClick={() =>
                            handleEditSubject(
                              subject[0],
                              subject[1],
                              subject[3]
                            )
                          }
                          className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors w-[46%] mr-1"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(subject[0])}
                          className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors w-[46%] ml-1"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed z-50 pt-[100px] left-0 top-0 w-full h-full bg-black bg-opacity-40">
          <div className="bg-white mx-auto p-5 border rounded-lg w-2/5">
            <span
              className="float-right text-gray-500 text-2xl font-bold hover:text-black cursor-pointer"
              onClick={() => setShowAddModal(false)}
            >
              &times;
            </span>
            <h2 className="text-xl font-bold mb-4">Add New Subject</h2>
            <form onSubmit={handleSubmit}>
              <label className="block mb-2">Subject Name:</label>
              <input
                type="text"
                className="w-full p-2 mb-4 border rounded"
                value={formData.subjectName}
                onChange={(e) =>
                  setFormData({ ...formData, subjectName: e.target.value })
                }
              />

              <label className="block mb-2">Assign Teacher:</label>
              <select
                className="w-full p-2 mb-4 border rounded cursor-pointer"
                value={formData.teacherId}
                onChange={(e) =>
                  setFormData({ ...formData, teacherId: e.target.value })
                }
              >
                <option value="invalid">Select Teacher</option>
                <option value="">Not Available</option>
                {teachers.map((teacher) => (
                  <option key={teacher[0]} value={teacher[0]}>
                    {teacher[2]}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
              >
                Add Subject
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {showEditModal && (
        <div className="fixed z-50 pt-[100px] left-0 top-0 w-full h-full bg-black bg-opacity-40">
          <div className="bg-white mx-auto p-5 border rounded-lg w-2/5">
            <span
              className="float-right text-gray-500 text-2xl font-bold hover:text-black cursor-pointer"
              onClick={() => setShowEditModal(false)}
            >
              &times;
            </span>
            <h2 className="text-xl font-bold mb-4">Edit Subject</h2>
            <form onSubmit={handleSave}>
              <label className="block mb-2">Subject Name:</label>
              <input
                type="text"
                className="w-full p-2 mb-4 border rounded"
                value={editFormData.subjectName}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    subjectName: e.target.value,
                  })
                }
                required
              />

              <label className="block mb-2">Assign Teacher:</label>
              <select
                className="w-full p-2 mb-4 border rounded cursor-pointer"
                value={editFormData.teacherId}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    teacherId: e.target.value,
                  })
                }
                required
              >
                <option value="invalid">Select Teacher</option>
                <option value="">Not Available</option>
                {teachers.map((teacher) => (
                  <option key={teacher[0]} value={teacher[0]}>
                    {teacher[2]}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
              >
                Save
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {showConfirmModal && (
        <div className="fixed z-50 pt-[200px] left-0 top-0 w-full h-full bg-black bg-opacity-40">
          <div className="bg-white mx-auto p-5 border rounded-lg w-1/3 lg:w-1/4">
            <p>Are you sure to delete?</p>
            <div className="mt-4">
              <button
                onClick={handleDelete}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors float-right"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectList;
