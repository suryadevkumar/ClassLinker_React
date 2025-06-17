import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getSubDetails,
  getStudentDetails,
  getAttendanceStats,
  markAttendance,
  updateAttendance,
  checkAttendanceMarked,
} from "../routes/attendanceRoutes";
import { useLocation } from "react-router-dom";

const MarkAttendance = () => {
  const [subId, setSubId] = useState(null);
  const [subDetails, setSubDetails] = useState("");
  const [students, setStudents] = useState([]);
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const subject_id = location.state?.subjectId;

  useEffect(() => {
    if (subject_id) {
      setSubId(subject_id);
    } else {
      setLoading(false);
    }
  }, [subject_id]);

  useEffect(() => {
    const initializeAttendanceSheet = async () => {
      if (!subId) return;

      try {
        setLoading(true);
        
        // Fetch subject details
        const details = await getSubDetails(subId);
        if (!details || !details[0]) {
          throw new Error("Invalid subject details received");
        }
        
        setSubDetails(
          `${details[0][0]}, ${details[0][1]}, ${details[0][2]}, ${details[0][3]}`
        );

        // Fetch student details
        const studentData = await getStudentDetails();
        setStudents(studentData);
        if (studentData.length > 0) {
          setSelectedStudent(studentData[0]);
        }
      } catch (error) {
        toast.error("Failed to initialize attendance sheet");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    initializeAttendanceSheet();
  }, [subId]);

  useEffect(() => {
    const fetchAttendanceStats = async () => {
      if (!selectedStudent || !subId) return;

      try {
        const stats = await getAttendanceStats(selectedStudent.std_id, subId);
        const totalClasses = stats.totalClasses;
        const totalPresent = stats.totalPresent;
        let attendancePercentage = 0;

        if (totalClasses > 0) {
          attendancePercentage = (
            (totalPresent / totalClasses) *
            100
          ).toFixed(2);
        }

        // Check if attendance already marked today
        const attendanceMarked = await checkAttendanceMarked(
          selectedStudent.std_id,
          subId
        );
        const todayStatus = attendanceMarked.exists
          ? attendanceMarked.status
          : null;

        // Update selected student with stats
        setSelectedStudent((prev) => ({
          ...prev,
          attendancePercentage,
          totalPresent,
          totalClasses,
          status: todayStatus || prev.status,
        }));

        // Update in students list
        setStudents((prevStudents) =>
          prevStudents.map((s) =>
            s.sch_id === selectedStudent.sch_id
              ? { ...s, status: todayStatus || s.status }
              : s
          )
        );
      } catch (error) {
        console.error("Error fetching attendance stats:", error);
      }
    };

    fetchAttendanceStats();
  }, [selectedStudent, subId]);

  const handleStudentClick = (student, index) => {
    setSelectedStudent(student);
    setCurrentStudentIndex(index);
  };

  const handleStatusChange = async (sch_id, std_id) => {
    if (!subId) return;

    try {
      const student = students.find((s) => s.sch_id === sch_id);
      if (!student) return;

      const currentStatus = student.status || "---";
      let updatedStatus = "";

      if (currentStatus === "Present" || currentStatus === "Absent") {
        updatedStatus = currentStatus === "Present" ? "Absent" : "Present";

        // Update local state first for immediate UI update
        const updatedStudents = students.map((s) =>
          s.sch_id === sch_id ? { ...s, status: updatedStatus } : s
        );
        setStudents(updatedStudents);

        if (selectedStudent?.sch_id === sch_id) {
          setSelectedStudent({ ...selectedStudent, status: updatedStatus });
        }

        // Call API to update in backend
        await updateAttendance(std_id, subId, updatedStatus);
        toast.success(`Status updated to ${updatedStatus}`);
      }
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    }
  };

  const handleMarkAttendance = async (status) => {
    if (!selectedStudent || !subId) return;

    try {
      // Check if attendance already marked today
      const attendanceMarked = await checkAttendanceMarked(
        selectedStudent.std_id,
        subId
      );

      if (attendanceMarked.exists) {
        toast.info(
          "Attendance already marked for today. You can only update the status."
        );
        return;
      }

      // Update local state first
      const updatedStudents = students.map((s, index) =>
        index === currentStudentIndex ? { ...s, status } : s
      );
      setStudents(updatedStudents);

      // Call API to mark attendance
      await markAttendance(selectedStudent.std_id, subId, status);
      toast.success(`Marked as ${status}`);

      // Move to next student if available
      if (currentStudentIndex < students.length - 1) {
        const nextIndex = currentStudentIndex + 1;
        setCurrentStudentIndex(nextIndex);
        setSelectedStudent(students[nextIndex]);
      } else {
        toast.info("All students attendance marked for today");
      }
    } catch (error) {
      toast.error("Failed to mark attendance");
      console.error(error);
    }
  };

  const openImageModal = (imageSrc, sch_id) => {
    setModalImage(imageSrc);
    setModalOpen(true);
    // Highlight the row
    const updatedStudents = students.map((s) => ({
      ...s,
      highlighted: s.sch_id === sch_id,
    }));
    setStudents(updatedStudents);
  };

  const closeModal = () => {
    setModalOpen(false);
    // Remove highlighting
    const updatedStudents = students.map((s) => ({ ...s, highlighted: false }));
    setStudents(updatedStudents);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-8rem)] bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!subId) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-8rem)] bg-gray-100">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            No Subject Selected
          </h2>
          <p className="text-gray-600">
            Please select a subject to mark attendance
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-2">
        {/* Heading */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-800 text-center">
            Attendance Sheet (
            <span className="text-indigo-600">{subDetails}</span>)
          </h2>
        </div>

        {/* Container */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Student Info Card */}
          <div className="w-full lg:w-1/3">
            {selectedStudent && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Student Image */}
                <div className="flex justify-center p-2">
                  <img
                    src={`data:image/png;base64,${selectedStudent.std_pic}`}
                    alt="Student"
                    className="w-40 h-40 object-cover rounded-full border-4 border-indigo-100"
                  />
                </div>

                {/* Student Info */}
                <div className="px-6 pb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                    Student Information
                  </h2>

                  <div className="space-y-3">
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium text-gray-600">
                        Scholar ID:
                      </span>
                      <span className="text-gray-800">
                        {selectedStudent.sch_id}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium text-gray-600">Name:</span>
                      <span className="text-gray-800">
                        {selectedStudent.std_name}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium text-gray-600">
                        Percentage:
                      </span>
                      <span className="text-gray-800">
                        {selectedStudent.attendancePercentage || "0"}%
                      </span>
                    </div>
                  </div>

                  {/* Attendance Circle */}
                  <div className="mt-3 flex flex-col items-center">
                    <div
                      className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center mb-1
                        ${
                          selectedStudent.attendancePercentage < 75
                            ? "border-red-500 text-red-500"
                            : "border-green-500 text-green-500"
                        }`}
                    >
                      <p className="text-sm font-medium">Present</p>
                      <p className="text-xl font-bold my-1">
                        {selectedStudent.totalPresent || "--"}/
                        {selectedStudent.totalClasses || "--"}
                      </p>
                      <p className="text-sm font-medium">Total days</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-2 flex justify-between gap-3">
                    <button
                      onClick={() => handleMarkAttendance("Present")}
                      disabled={selectedStudent.status === "Present"}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all
                        ${
                          selectedStudent.status === "Present"
                            ? "bg-green-300 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600 text-white"
                        }`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => handleMarkAttendance("Absent")}
                      disabled={selectedStudent.status === "Absent"}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all
                        ${
                          selectedStudent.status === "Absent"
                            ? "bg-red-300 cursor-not-allowed"
                            : "bg-red-500 hover:bg-red-600 text-white"
                        }`}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Student List */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-indigo-600 text-white">
                    <tr>
                      <th className="py-3 px-4 text-left">Scholar ID</th>
                      <th className="py-3 px-4 text-left">Photo</th>
                      <th className="py-3 px-4 text-left">Name</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.map((student, index) => (
                      <tr
                        key={student.sch_id}
                        onClick={() => handleStudentClick(student, index)}
                        className={`transition-colors cursor-pointer
                          ${
                            selectedStudent?.sch_id === student.sch_id
                              ? "bg-indigo-50"
                              : ""
                          }
                          ${student.highlighted ? "bg-yellow-100" : ""}
                          hover:bg-gray-50`}
                      >
                        <td className="py-3 px-4">{student.sch_id}</td>
                        <td className="py-3 px-4">
                          <img
                            src={`data:image/png;base64,${student.std_pic}`}
                            className="w-10 h-10 rounded-full object-cover cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              openImageModal(
                                `data:image/png;base64,${student.std_pic}`,
                                student.sch_id
                              );
                            }}
                            alt="Student"
                          />
                        </td>
                        <td className="py-3 px-4">{student.std_name}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block py-1 px-3 rounded-full text-xs font-medium
                            ${
                              student.status === "Present"
                                ? "bg-green-100 text-green-800"
                                : ""
                            }
                            ${
                              student.status === "Absent"
                                ? "bg-red-100 text-red-800"
                                : ""
                            }
                            ${
                              !student.status ? "bg-gray-100 text-gray-800" : ""
                            }`}
                          >
                            {student.status || "---"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(
                                student.sch_id,
                                student.std_id
                              );
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm transition-colors"
                          >
                            Change
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Image Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          onClick={closeModal}
        >
          <div className="bg-white rounded-lg p-4 max-w-md w-full">
            <div className="flex justify-end mb-2">
              <button
                onClick={closeModal}
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
            <img
              src={modalImage}
              className="w-full h-96 object-contain"
              alt="Enlarged student"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkAttendance;