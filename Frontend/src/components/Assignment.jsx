import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getAssignmentList,
  uploadAssignment,
  downloadAssignment,
  deleteAssignment,
  getSubmittedAssignments,
  viewStudentAssignment,
  submitAssignment,
  getStudentSubmissions,
  downloadSubmittedAssignment,
} from "../routes/assignmentRoutes";
import { FaDownload, FaEye, FaStar, FaTrash } from "react-icons/fa";
import fileImage from "../assets/img/file.png";
import { useLocation } from "react-router-dom";

const Assignment = () => {
  // Assignment states
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitDate, setSubmitDate] = useState("");
  const [file, setFile] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);

  // Submission states
  const [submissions, setSubmissions] = useState([]);
  const [studentSubmissions, setStudentSubmissions] = useState({});
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const location = useLocation();
  const subId = location.state?.subjectId;
  const userType = location.state?.userType;
  const subjectName = location.state?.subjectName;

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const assignmentList = await getAssignmentList(subId);
        setAssignments(assignmentList);

        // Load student submissions if user is student
        if (userType === "student") {
          const submissionsMap = {};
          for (const assignment of assignmentList) {
            try {
              const submissionData = await getStudentSubmissions(assignment[0]);
              submissionsMap[assignment[0]] = submissionData;
            } catch (err) {
              console.error(
                `Error loading submissions for ${assignment[0]}:`,
                err
              );
            }
          }
          setStudentSubmissions(submissionsMap);
        }
      } catch (error) {
        toast.error("Failed to load assignments");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [subId, userType]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleStudentFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !file || !dueDate) {
      toast.error("Please provide all required fields!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("assignmentTitle", title);
      formData.append("assignmentFile", file);
      formData.append("sub_id", subId);
      formData.append("dueDate", dueDate);

      await uploadAssignment(formData);
      toast.success("Assignment uploaded successfully");

      // Refresh assignments list
      const assignmentList = await getAssignmentList(subId);
      setAssignments(assignmentList);

      // Reset form
      setTitle("");
      setFile(null);
      document.getElementById("assignmentFile").value = "";
    } catch (error) {
      toast.error("Error uploading assignment");
    }
  };

  const handleStudentSubmit = async (as_id) => {
    if (!selectedFile) {
      toast.warning("Please select a file first");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("pdfFile", selectedFile);
      formData.append("as_id", as_id);

      await submitAssignment(formData);
      toast.success("Assignment submitted successfully");

      // Refresh submissions
      const submissionData = await getStudentSubmissions(as_id);
      setStudentSubmissions((prev) => ({
        ...prev,
        [as_id]: submissionData,
      }));

      setSelectedFile(null);
      document.getElementById(`fileInput-${as_id}`).value = "";
    } catch (error) {
      console.error("Error submitting assignment:", error);
      toast.error(error.response?.data?.error || "Failed to submit assignment");
    }
  };

  const handleDownload = async (assignId) => {
    try {
      const { data, fileName, contentType } = await downloadAssignment(
        assignId
      );

      // Create blob with correct file type
      const blob = new Blob([data], { type: contentType });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Download started");
    } catch (error) {
      toast.error("Failed to download assignment");
      console.error("Download error:", error);
    }
  };

  const handleView = async (assignId) => {
    try {
      const { data, contentType } = await downloadAssignment(assignId);
      const blob = new Blob([data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      toast.error("Failed to open assignment");
      console.error("View error:", error);
    }
  };

  const promptDelete = (assignmentId) => {
    setAssignmentToDelete(assignmentId);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!assignmentToDelete) return;

    try {
      await deleteAssignment(assignmentToDelete);
      toast.success("Assignment deleted successfully");

      // Refresh assignments list
      const assignmentList = await getAssignmentList(subId);
      setAssignments(assignmentList);
    } catch (error) {
      toast.error("Error deleting assignment");
    } finally {
      setShowDeleteConfirm(false);
      setAssignmentToDelete(null);
    }
  };

  const handleViewSubmissions = async (assignmentId, lastDate) => {
    try {
      setSubmissionsLoading(true);
      setSubmitDate(lastDate);
      const data = await getSubmittedAssignments(assignmentId);
      setSubmissions(data);
      setShowSubmissions(true);
    } catch (error) {
      toast.error("Failed to load submissions");
      console.error("Error loading submissions:", error);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleViewStudentAssignment = async (submitId) => {
    try {
      const response = await viewStudentAssignment(submitId);
      const blob = new Blob([response.data], { type: response.contentType });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      toast.error("Failed to view assignment");
      console.error("Error viewing assignment:", error);
    }
  };

  const handleViewSubmission = async (submitId) => {
    try {
      const response = await downloadSubmittedAssignment(submitId);
      const blob = new Blob([response.data], { type: response.contentType });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      toast.error("Failed to view submission");
      console.error("Error viewing submission:", error);
    }
  };

  const handleDownloadSubmission = async (submitId) => {
    try {
      const response = await downloadSubmittedAssignment(submitId);
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: response.contentType })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        response.fileName || `submission_${submitId}`
      );
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Error downloading submission:", error);
      toast.error("Failed to download submission");
    }
  };

  const isSubmissionOnTime = (submissionDate, dueDate) => {
    try {
      const subDate = new Date(submissionDate);
      const assignmentDueDate = new Date(dueDate || submitDate);
      return subDate <= assignmentDueDate;
    } catch {
      return false;
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString || "Date not available";
    }
  };

  const closeSubmissions = () => {
    setShowSubmissions(false);
    setSubmissions([]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-amber-50 to-pink-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-amber-50 to-pink-100 flex flex-col">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
            <p className="mb-6">
              Are you sure you want to delete this assignment? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setAssignmentToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {!showSubmissions ? (
          <>
            {/* Upload Form */}
            {userType === "teacher" && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8 w-full lg:w-1/2 mx-auto">
                <h2 className="text-2xl font-bold mb-4 text-center">
                  Upload Assignment
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="assignmentTitle"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Assignment Title
                    </label>
                    <input
                      type="text"
                      id="assignmentTitle"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter assignment title"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="dueDate"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Due Date
                    </label>
                    <input
                      type="datetime-local"
                      id="dueDate"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="assignmentFile"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Assignment File
                    </label>
                    <input
                      type="file"
                      id="assignmentFile"
                      onChange={handleFileChange}
                      accept=".pdf,.docx,.txt,.jpeg,.jpg,.png"
                      className="w-full px-4 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                  >
                    Upload Assignment
                  </button>
                </form>
              </div>
            )}

            {/* Assignments List */}
            <div className="w-full lg:w-2/3 mx-auto">
              <h2 className="text-2xl font-bold mb-4">
                {subjectName
                  ? `${subjectName} - Assignments`
                  : "Assignments List"}
              </h2>
              {assignments.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <p className="text-gray-500">No assignments available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments.map((assignment, index) => (
                    <div
                      key={assignment[0]}
                      className="bg-white rounded-xl shadow-lg p-4"
                    >
                      <div className="flex items-center">
                        <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-4">
                          {index + 1}
                        </div>
                        <div className="mx-4">
                          <img
                            src={fileImage}
                            alt="Assignment"
                            className="w-8 h-8"
                          />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-semibold">{assignment[1]}</h3>
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-semibold">
                            Due date:{" "}
                            <span
                              className={
                                new Date(assignment[2]) < new Date()
                                  ? "text-red-500"
                                  : "text-green-500"
                              }
                            >
                              {formatDate(assignment[2])}
                            </span>
                          </h3>
                        </div>

                        <div className="flex space-x-2">
                          {userType === "teacher" && (
                            <button
                              onClick={() =>
                                handleViewSubmissions(
                                  assignment[0],
                                  assignment[2]
                                )
                              }
                              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition duration-200"
                              title="View Submissions"
                            >
                              View Submissions
                            </button>
                          )}
                          <div
                            onClick={() => handleView(assignment[0])}
                            title="View"
                            className="cursor-pointer"
                          >
                            <FaEye className="m-2 text-blue-600 text-xl transition-transform duration-200 hover:scale-125" />
                          </div>
                          <div
                            onClick={() => handleDownload(assignment[0])}
                            title="Download"
                            className="cursor-pointer"
                          >
                            <FaDownload className="m-2 text-green-600 text-xl transition-transform duration-200 hover:scale-125" />
                          </div>
                          {userType === "teacher" && (
                            <div
                              onClick={() => promptDelete(assignment[0])}
                              title="Delete"
                              className="cursor-pointer"
                            >
                              <FaTrash className="m-2 text-red-600 text-xl transition-transform duration-200 hover:scale-125" />
                            </div>
                          )}
                        </div>
                      </div>

                      {userType === "student" && studentSubmissions[assignment[0]].length == 0 && (
                        <div className="mt-4 border-t pt-4">
                          <h4 className="font-medium mb-2">Submit Your Work</h4>
                          <div className="flex flex-col sm:flex-row gap-4">
                            <input
                              id={`fileInput-${assignment[0]}`}
                              type="file"
                              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                              onChange={handleStudentFileChange}
                              className="border rounded px-3 py-2 flex-grow"
                            />
                            <button
                              onClick={() => handleStudentSubmit(assignment[0])}
                              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded whitespace-nowrap"
                            >
                              Submit
                            </button>
                          </div>
                        </div>
                      )}

                      {studentSubmissions[assignment[0]]?.length > 0 &&
                        userType === "student" && (
                          <div className="mt-4 border-t pt-4">
                            <h4 className="font-medium mb-2">
                              Your Submissions
                            </h4>
                            <div className="space-y-2">
                              {studentSubmissions[assignment[0]].map(
                                (submission) => (
                                  <div
                                    key={submission[0]}
                                    className="bg-gray-50 p-3 rounded"
                                  >
                                    <div className="flex justify-between items-center">
                                      <div className="flex items-center gap-2">
                                        <FaStar
                                          className={`text-lg ${isSubmissionOnTime(
                                            submission[1],
                                            assignment[2]
                                          )
                                            ? "text-green-500"
                                            : "text-red-500"
                                            }`}
                                          title={
                                            isSubmissionOnTime(
                                              submission[1],
                                              assignment[2]
                                            )
                                              ? "Submitted on time"
                                              : "Submitted late"
                                          }
                                        />
                                        <span className="font-medium">
                                          Submitted on:{" "}
                                          {formatDate(submission[1])}
                                        </span>
                                      </div>

                                      <div className="flex gap-2 items-center">
                                        <div
                                          onClick={() =>
                                            handleViewSubmission(submission[0])
                                          }
                                          title="View"
                                          className="cursor-pointer"
                                        >
                                          <FaEye className="m-2 text-blue-600 text-xl transition-transform duration-200 hover:scale-125" />
                                        </div>
                                        <div
                                          onClick={() =>
                                            handleDownloadSubmission(submission[0])
                                          }
                                          title="Download"
                                          className="cursor-pointer"
                                        >
                                          <FaDownload className="m-2 text-green-600 text-xl transition-transform duration-200 hover:scale-125" />
                                        </div>

                                        {submission[2] && (
                                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                            Grade: {submission[2]}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    {submission[3] && (
                                      <div className="mt-2 text-sm bg-yellow-50 p-2 rounded">
                                        <span className="font-medium">
                                          Feedback:{" "}
                                        </span>
                                        {submission[3]}
                                      </div>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Submissions View */
          <div className="w-full">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">
                Submitted Assignments
              </h1>
              <button
                onClick={closeSubmissions}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                Back to Assignments
              </button>
            </div>

            {/* Submissions Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {submissionsLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                </div>
              ) : submissions.length === 0 ? (
                <div className="p-8 text-center text-gray-600">
                  No assignments submitted yet for this assignment
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className=""></th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">
                          Scholar ID
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">
                          Student Name
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">
                          Submitted On
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">
                          Grade
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {submissions.map((submission, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <FaStar
                              className={`text-lg ${isSubmissionOnTime(submission[3])
                                ? "text-green-500"
                                : "text-red-500"
                                }`}
                              title={
                                isSubmissionOnTime(submission[3])
                                  ? "Submitted on time"
                                  : "Submitted late"
                              }
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {submission[1]}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {submission[2]}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(submission[3])}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {submission[4] ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                {submission[4]}
                              </span>
                            ) : (
                              <span className="text-gray-500">Not graded</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() =>
                                handleViewStudentAssignment(submission[0])
                              }
                              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
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
          </div>
        )}
      </main>
    </div>
  );
};

export default Assignment;
