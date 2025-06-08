import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getUnverifiedUser, verifyUser, deleteUser } from "../routes/adminRoutes";
import StudentDetails from "./StudentDetails";
import TeacherDetails from "./TeacherDetails";

const JoinRequests = () => {
  const [teacherRequests, setTeacherRequests] = useState([]);
  const [studentRequests, setStudentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);

  useEffect(() => {
    // Fetch teacher requests
    const getAllUnverifiedUser = async () => {
      setLoading(true);
      const response = await getUnverifiedUser();
      setTeacherRequests(response.teachers);
      setStudentRequests(response.students);
      setLoading(false);
    };
    getAllUnverifiedUser();
  }, []);

  const handleVerification = async (userId, userType, action) => {
    try {
      const response =
        action === "accept"
          ? await verifyUser(userId, userType)
          : await deleteUser(userId, userType);

      if (response.success) {
        toast.success(
          `${userType} ${
            action === "accept" ? "verified" : "deleted"
          } successfully`
        );

        // Update state
        if (userType === "Teacher") {
          setTeacherRequests((prev) =>
            action === "accept"
              ? prev.map((teacher) =>
                  teacher.tch_id === userId
                    ? { ...teacher, status: "accept" }
                    : teacher
                )
              : prev.filter((teacher) => teacher.tch_id !== userId)
          );
        } else {
          setStudentRequests((prev) =>
            action === "accept"
              ? prev.map((student) =>
                  student.std_id === userId
                    ? { ...student, status: "accept" }
                    : student
                )
              : prev.filter((student) => student.std_id !== userId)
          );
        }
      }
    } catch (error) {
      toast.error(
        `Error ${action === "accept" ? "verifying" : "deleting"} ${userType}`
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-amber-100 to-pink-200">
      {/* Main Content */}
      <div className="flex-grow py-8">
        {/* Teacher Requests */}
        <section className="container mx-auto px-4 mb-8">
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <h2 className="text-xl font-semibold mb-4">
                Loading requests...
              </h2>
            ) : teacherRequests.length > 0 ? (
              <>
                <h2 className="text-xl font-semibold mb-4">Teacher Requests</h2>
                {teacherRequests.map((teacher, index) => (
                  <div
                    key={`teacher-${teacher.tch_id}`}
                    className="bg-white p-4 rounded-lg shadow-md mb-4 flex justify-between items-center"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="bg-rose-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center">
                        {index + 1}
                      </span>
                      <img
                        src={`data:image/png;base64,${teacher.tch_pic}`}
                        alt={`Teacher ${index + 1}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3
                          className="text-lg font-medium text-gray-800 cursor-pointer hover:underline"
                          onClick={() => setSelectedTeacherId(teacher.tch_id)}
                        >
                          {teacher.tch_name}
                        </h3>
                      </div>
                    </div>
                    {/* Teacher Requests */}
                    <div className="flex space-x-2">
                      <button
                        className={`px-4 py-2 rounded w-20 ${
                          teacher.status === "accept"
                            ? "bg-green-500 text-white w-44 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600 text-white"
                        }`}
                        onClick={() => handleVerification(teacher.tch_id, "Teacher", "accept")}
                        disabled={teacher.status === "accept"}
                      >
                        {teacher.status === "accept" ? "Verified" : "Verify"}
                      </button>

                      {teacher.status !== "accept" && (
                        <button
                          className="px-4 py-2 rounded w-20 bg-red-500 hover:bg-red-600 text-white"
                          onClick={() => handleVerification(teacher.tch_id, "Teacher", "deny")}
                        >
                          Deny
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <h2 className="text-xl font-semibold">No Teacher Requests</h2>
            )}
          </div>
        </section>

        {/* Student Requests */}
        <section className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {studentRequests.length > 0 ? (
              <>
                <h2 className="text-xl font-semibold mb-4">Student Requests</h2>
                {studentRequests.map((student, index) => (
                  <div
                    key={`student-${student.std_id}`}
                    className="bg-white p-4 rounded-lg shadow-md mb-4 flex justify-between items-center"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="bg-rose-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center">
                        {index + 1}
                      </span>
                      <img
                        src={`data:image/png;base64,${student.std_pic}`}
                        alt={`Student ${index + 1}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h3
                          className="text-lg font-medium text-gray-800 cursor-pointer hover:underline"
                          onClick={() => setSelectedStudentId(student.std_id)}
                        >
                          {student.std_name}
                        </h3>
                      </div>
                    </div>
                    {/* Student Requests */}
                    <div className="flex space-x-2">
                      <button
                        className={`px-4 py-2 rounded w-36 ${
                          student.status === "accept"
                            ? "bg-green-500 text-white w-44 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600 text-white"
                        }`}
                        onClick={() => handleVerification(student.std_id, "Student", "accept")}
                        disabled={student.status === "accept"}
                      >
                        {student.status === "accept" ? "Verified" : "Verify"}
                      </button>

                      {student.status !== "accept" && (
                        <button
                          className="px-4 py-2 rounded w-36 bg-red-500 hover:bg-red-600 text-white"
                          onClick={() => handleVerification(student.std_id, "Student", "deny")}
                        >
                          Deny
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <h2 className="text-xl font-semibold">No Student Requests</h2>
            )}
          </div>
        </section>

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
