import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { 
  FaDownload, FaEye, FaStar, FaTrash, FaUpload, 
  FaChevronLeft, FaFileAlt, FaCheckCircle, FaTimesCircle 
} from "react-icons/fa";
import { 
  getAssignmentList, uploadAssignment, downloadAssignment, 
  deleteAssignment, getSubmittedAssignments, viewStudentAssignment,
  submitAssignment, getStudentSubmissions, downloadSubmittedAssignment
} from "../routes/assignmentRoutes";
import { useLocation, useNavigate } from "react-router-dom";

const Assignment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const subId = location.state?.subjectId;
  const userType = location.state?.userType;
  const subjectName = location.state?.subjectName;

  // Assignment states
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [file, setFile] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Submission states
  const [submissions, setSubmissions] = useState([]);
  const [studentSubmissions, setStudentSubmissions] = useState({});
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const assignmentList = await getAssignmentList(subId);
        setAssignments(assignmentList);

        if (userType === "student") {
          const submissionsMap = {};
          for (const assignment of assignmentList) {
            try {
              const submissionData = await getStudentSubmissions(assignment[0]);
              submissionsMap[assignment[0]] = submissionData;
            } catch (err) {
              console.error(`Error loading submissions for ${assignment[0]}:`, err);
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

    setUploading(true);
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
      setDueDate("");
      document.getElementById("assignmentFile").value = "";
    } catch (error) {
      toast.error("Error uploading assignment");
    } finally {
      setUploading(false);
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
      const { data, fileName, contentType } = await downloadAssignment(assignId);
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
      setEndDate(lastDate);
      setSubmissionsLoading(true);
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
      link.setAttribute("download", response.fileName || `submission_${submitId}`);
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
      const assignmentDueDate = new Date(dueDate);
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

  const handleBack = () => {
    navigate(`/${userType}Dashboard`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-8rem)] bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this assignment? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
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

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-indigo-800 flex items-center">
            <FaFileAlt className="mr-2" />
            {subjectName} Assignments
          </h1>
          <p className="text-indigo-600">{userType === 'teacher' ? 'Manage' : 'View'} course assignments</p>
        </div>
        <button
          onClick={handleBack}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mt-4 md:mt-0"
        >
          <FaChevronLeft className="mr-1" />
          Back to Dashboard
        </button>
      </div>

      {/* Main Content */}
      {!showSubmissions ? (
        <>
          {/* Upload Form - Only for teachers */}
          {userType === "teacher" && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-indigo-700 mb-4 flex items-center">
                <FaUpload className="mr-2" />
                Upload New Assignment
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter assignment title"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assignment File</label>
                  <div className="flex items-center">
                    <label className="flex flex-col items-center px-4 py-6 bg-white rounded-lg border border-dashed border-gray-300 cursor-pointer hover:bg-blue-50 w-full">
                      {file ? (
                        <div className="text-center">
                          <FaFileAlt className="mx-auto text-2xl text-indigo-600 mb-2" />
                          <p className="text-sm font-medium text-gray-800">{file.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <FaUpload className="mx-auto text-2xl text-indigo-600 mb-2" />
                          <p className="text-sm text-gray-600">Click to select file</p>
                          <p className="text-xs text-gray-500 mt-1">Supports: PDF, DOCX, TXT, Images (Max 50MB)</p>
                        </div>
                      )}
                      <input
                        id="assignmentFile"
                        type="file"
                        accept=".pdf,.docx,.txt,.jpeg,.jpg,.png"
                        onChange={handleFileChange}
                        className="hidden"
                        required
                      />
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className={`w-full flex items-center justify-center py-3 px-4 rounded-lg text-white font-medium ${
                    uploading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                  } transition`}
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    'Upload Assignment'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Assignments List */}
          <div className="bg-white lg:w-2/3 mx-auto rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 bg-indigo-50 border-b border-indigo-100">
              <h2 className="text-lg font-semibold text-indigo-700">
                {assignments.length} {assignments.length === 1 ? 'Assignment' : 'Assignments'} Available
              </h2>
            </div>

            {assignments.length === 0 ? (
              <div className="p-8 text-center">
                <FaFileAlt className="mx-auto text-4xl text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-500">No assignments available yet</h3>
                {userType === 'teacher' && (
                  <p className="text-gray-500 mt-2">Upload your first assignment using the form above</p>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {assignments.map((assignment, index) => (
                  <div key={assignment[0]} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-indigo-100 text-indigo-600 rounded-lg p-3">
                          <span className="font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{assignment[1]}</h3>
                          <div className="flex items-center mt-1 text-sm text-gray-600">
                            <span className="font-medium">Due:</span>
                            <span className={`ml-1 ${new Date(assignment[2]) < new Date() ? 'text-red-500' : 'text-green-500'}`}>
                              {formatDate(assignment[2])}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {userType === "teacher" && (
                          <button
                            onClick={() => handleViewSubmissions(assignment[0], assignment[2])}
                            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition flex items-center"
                          >
                            <FaEye className="mr-2" />
                            Submissions
                          </button>
                        )}
                        <button
                          onClick={() => handleView(assignment[0])}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                          title="View"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleDownload(assignment[0])}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                          title="Download"
                        >
                          <FaDownload />
                        </button>
                        {userType === "teacher" && (
                          <button
                            onClick={() => promptDelete(assignment[0])}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Student Submission Section */}
                    {userType === "student" && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium mb-3">
                          {studentSubmissions[assignment[0]]?.length > 0 
                            ? "Your Submissions" 
                            : "Submit Your Work"}
                        </h4>

                        {studentSubmissions[assignment[0]]?.length > 0 ? (
                          <div className="space-y-3">
                            {studentSubmissions[assignment[0]].map((submission) => (
                              <div key={submission[0]} className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    {isSubmissionOnTime(submission[1], assignment[2]) ? (
                                      <FaCheckCircle className="text-green-500" title="Submitted on time" />
                                    ) : (
                                      <FaTimesCircle className="text-red-500" title="Submitted late" />
                                    )}
                                    <span className="font-medium">
                                      Submitted: {formatDate(submission[1])}
                                    </span>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleViewSubmission(submission[0])}
                                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                                      title="View"
                                    >
                                      <FaEye />
                                    </button>
                                    <button
                                      onClick={() => handleDownloadSubmission(submission[0])}
                                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                                      title="Download"
                                    >
                                      <FaDownload />
                                    </button>
                                  </div>
                                </div>
                                {submission[2] && (
                                  <div className="mt-2 flex items-center gap-2">
                                    <span className="font-medium">Grade:</span>
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                                      {submission[2]}
                                    </span>
                                  </div>
                                )}
                                {submission[3] && (
                                  <div className="mt-2 text-sm bg-yellow-50 p-2 rounded">
                                    <span className="font-medium">Feedback: </span>
                                    {submission[3]}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row gap-3">
                            <label className="flex-grow">
                              <div className="flex items-center px-4 py-2 bg-white rounded-lg border border-dashed border-gray-300 cursor-pointer hover:bg-blue-50">
                                <FaUpload className="mr-2 text-indigo-600" />
                                <span className="text-sm">
                                  {selectedFile ? selectedFile.name : 'Select file'}
                                </span>
                                <input
                                  id={`fileInput-${assignment[0]}`}
                                  type="file"
                                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                  onChange={handleStudentFileChange}
                                  className="hidden"
                                />
                              </div>
                            </label>
                            <button
                              onClick={() => handleStudentSubmit(assignment[0])}
                              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg whitespace-nowrap transition flex items-center justify-center"
                              disabled={!selectedFile}
                            >
                              <FaUpload className="mr-2" />
                              Submit
                            </button>
                          </div>
                        )}
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
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-indigo-700">
              Submissions ({submissions.length})
            </h2>
            <button
              onClick={closeSubmissions}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
            >
              Back to Assignments
            </button>
          </div>

          {submissionsLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : submissions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No submissions yet for this assignment
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scholar ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted On
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <tr key={submission[0]} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isSubmissionOnTime(submission[3], endDate) ? (
                          <FaCheckCircle className="text-green-500" title="Submitted on time" />
                        ) : (
                          <FaTimesCircle className="text-red-500" title="Submitted late" />
                        )}
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
                          onClick={() => handleViewStudentAssignment(submission[0])}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition mr-2"
                          title="View"
                        >
                          <FaEye />
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
  );
};

export default Assignment;