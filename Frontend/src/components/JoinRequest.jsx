import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaUserGraduate, FaChalkboardTeacher, FaCheck, FaTimes, FaSpinner } from "react-icons/fa";
import { getUnverifiedUser, verifyUser, deleteUser } from "../routes/adminRoutes";
import StudentDetails from "./StudentDetails";
import TeacherDetails from "./TeacherDetails";

const JoinRequests = () => {
  const [teacherRequests, setTeacherRequests] = useState([]);
  const [studentRequests, setStudentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    const getAllUnverifiedUser = async () => {
      setLoading(true);
      try {
        const response = await getUnverifiedUser();
        setTeacherRequests(response.teachers);
        setStudentRequests(response.students);
      } catch (error) {
        toast.error("Failed to load requests");
      } finally {
        setLoading(false);
      }
    };
    getAllUnverifiedUser();
  }, []);

  const handleVerification = async (userId, userType, action) => {
    setProcessing(prev => ({ ...prev, [userId]: true }));
    try {
      const response =
        action === "accept"
          ? await verifyUser(userId, userType)
          : await deleteUser(userId, userType);

      if (response.success) {
        toast.success(
          `${userType} ${action === "accept" ? "verified" : "rejected"} successfully`
        );

        if (userType === "Teacher") {
          setTeacherRequests(prev =>
            action === "accept"
              ? prev.map(teacher =>
                  teacher.tch_id === userId
                    ? { ...teacher, status: "accept" }
                    : teacher
                )
              : prev.filter(teacher => teacher.tch_id !== userId)
          );
        } else {
          setStudentRequests(prev =>
            action === "accept"
              ? prev.map(student =>
                  student.std_id === userId
                    ? { ...student, status: "accept" }
                    : student
                )
              : prev.filter(student => student.std_id !== userId)
          );
        }
      }
    } catch (error) {
      toast.error(
        `Error ${action === "accept" ? "verifying" : "rejecting"} ${userType}`
      );
    } finally {
      setProcessing(prev => ({ ...prev, [userId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-indigo-800">Loading join requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-br from-blue-50 to-indigo-100 py-4">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-800">Join Requests</h1>
          <p className="text-indigo-600 mt-2">Approve or reject new user registrations</p>
        </div>

        {/* Teacher Requests */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-indigo-600 p-4 text-white flex items-center">
            <FaChalkboardTeacher className="mr-2 text-xl" />
            <h2 className="text-xl font-semibold">Teacher Requests</h2>
          </div>
          
          <div className="p-6">
            {teacherRequests.length > 0 ? (
              <div className="space-y-4">
                {teacherRequests.map((teacher, index) => (
                  <div
                    key={`teacher-${teacher.tch_id}`}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    <div 
                      className="flex items-center space-x-4 cursor-pointer mb-4 md:mb-0"
                      onClick={() => setSelectedTeacherId(teacher.tch_id)}
                    >
                      <div className="relative">
                        <img
                          src={`data:image/png;base64,${teacher.tch_pic}`}
                          alt={`Teacher ${index + 1}`}
                          className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100"
                        />
                        <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-800 hover:underline">
                          {teacher.tch_name}
                        </h3>
                        <p className="text-sm text-gray-600">{teacher.tch_email}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        className={`px-4 py-2 rounded-lg flex items-center ${
                          teacher.status === "accept"
                            ? "bg-green-100 text-green-800 w-32 justify-center cursor-default"
                            : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                        onClick={() => handleVerification(teacher.tch_id, "Teacher", "accept")}
                        disabled={teacher.status === "accept" || processing[teacher.tch_id]}
                      >
                        {processing[teacher.tch_id] ? (
                          <FaSpinner className="animate-spin mr-2" />
                        ) : teacher.status === "accept" ? (
                          <>
                            <FaCheck className="mr-2" />
                            Verified
                          </>
                        ) : (
                          <>
                            <FaCheck className="mr-2" />
                            Approve
                          </>
                        )}
                      </button>

                      {teacher.status !== "accept" && (
                        <button
                          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center"
                          onClick={() => handleVerification(teacher.tch_id, "Teacher", "deny")}
                          disabled={processing[teacher.tch_id]}
                        >
                          {processing[teacher.tch_id] ? (
                            <FaSpinner className="animate-spin mr-2" />
                          ) : (
                            <>
                              <FaTimes className="mr-2" />
                              Reject
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaChalkboardTeacher className="mx-auto text-4xl mb-4 text-gray-400" />
                <p>No pending teacher requests</p>
              </div>
            )}
          </div>
        </div>

        {/* Student Requests */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-indigo-600 p-4 text-white flex items-center">
            <FaUserGraduate className="mr-2 text-xl" />
            <h2 className="text-xl font-semibold">Student Requests</h2>
          </div>
          
          <div className="p-6">
            {studentRequests.length > 0 ? (
              <div className="space-y-4">
                {studentRequests.map((student, index) => (
                  <div
                    key={`student-${student.std_id}`}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    <div 
                      className="flex items-center space-x-4 cursor-pointer mb-4 md:mb-0"
                      onClick={() => setSelectedStudentId(student.std_id)}
                    >
                      <div className="relative">
                        <img
                          src={`data:image/png;base64,${student.std_pic}`}
                          alt={`Student ${index + 1}`}
                          className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100"
                        />
                        <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-800 hover:underline">
                          {student.std_name}
                        </h3>
                        <p className="text-sm text-gray-600">{student.std_email}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        className={`px-4 py-2 rounded-lg flex items-center ${
                          student.status === "accept"
                            ? "bg-green-100 text-green-800 w-32 justify-center cursor-default"
                            : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                        onClick={() => handleVerification(student.std_id, "Student", "accept")}
                        disabled={student.status === "accept" || processing[student.std_id]}
                      >
                        {processing[student.std_id] ? (
                          <FaSpinner className="animate-spin mr-2" />
                        ) : student.status === "accept" ? (
                          <>
                            <FaCheck className="mr-2" />
                            Verified
                          </>
                        ) : (
                          <>
                            <FaCheck className="mr-2" />
                            Approve
                          </>
                        )}
                      </button>

                      {student.status !== "accept" && (
                        <button
                          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center"
                          onClick={() => handleVerification(student.std_id, "Student", "deny")}
                          disabled={processing[student.std_id]}
                        >
                          {processing[student.std_id] ? (
                            <FaSpinner className="animate-spin mr-2" />
                          ) : (
                            <>
                              <FaTimes className="mr-2" />
                              Reject
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaUserGraduate className="mx-auto text-4xl mb-4 text-gray-400" />
                <p>No pending student requests</p>
              </div>
            )}
          </div>
        </div>

        {/* Detail Modals */}
        {selectedStudentId && (
          <StudentDetails
            studentId={selectedStudentId}
            onClose={() => setSelectedStudentId(null)}
          />
        )}

        {selectedTeacherId && (
          <TeacherDetails
            teacherId={selectedTeacherId}
            onClose={() => setSelectedTeacherId(null)}
          />
        )}
      </div>
    </div>
  );
};

export default JoinRequests;