import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getAssignmentList,
  downloadAssignment,
  submitAssignment,
  getStudentSubmissions,
  downloadSubmittedAssignment,
} from "../routes/assignmentRoutes";
import fileImage from "../assets/img/file.png";
import { FaStar } from "react-icons/fa";

const StudentAssignment = () => {
  const location = useLocation();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [subjectName, setSubjectName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        setSubjectName(location.state?.subjectName);
        const assignmentsData = await getAssignmentList(
          location.state?.subjectId
        );
        setAssignments(assignmentsData);

        const submissionsMap = {};
        for (const assignment of assignmentsData) {
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
        setSubmissions(submissionsMap);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load assignments");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (as_id) => {
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
      setSubmissions((prev) => ({
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

  const handleViewAssignment = async (assignId) => {
    try {
      const response = await downloadAssignment(assignId);
      const fileType = response.contentType;
      const blob = new Blob([response.data], { type: fileType });
      const fileURL = URL.createObjectURL(blob);
      
      // Open in new tab
      window.open(fileURL, '_blank');
      
      // Clean up after some time
      setTimeout(() => {
        URL.revokeObjectURL(fileURL);
      }, 10000);
    } catch (error) {
      console.error("Error viewing assignment:", error);
      toast.error("Failed to view assignment");
    }
  };

  const handleViewSubmission = async (submitId) => {
    try {
      const response = await downloadSubmittedAssignment(submitId);
      const fileType = response.contentType;
      const blob = new Blob([response.data], { type: fileType });
      const fileURL = URL.createObjectURL(blob);
      
      // Open in new tab
      window.open(fileURL, '_blank');
      
      // Clean up after some time
      setTimeout(() => {
        URL.revokeObjectURL(fileURL);
      }, 10000);
    } catch (error) {
      console.error("Error viewing submission:", error);
      toast.error("Failed to view submission");
    }
  };

  const handleDownloadAssignment = async (assignId) => {
    try {
      const response = await downloadAssignment(assignId);
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: response.contentType })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", response.fileName);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Error downloading assignment:", error);
      toast.error("Failed to download assignment");
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

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString || "Date not available";
    }
  };

  const isSubmissionOnTime = (submissionDate, dueDate) => {
    try {
      const submitDate = new Date(submissionDate);
      const assignmentDueDate = new Date(dueDate);
      return submitDate <= assignmentDueDate;
    } catch {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-orange-100 to-pink-200">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      )}

      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-6">
            Subject: <span className="text-orange-600">{subjectName}</span>
          </h2>

          <div className="space-y-6">
            {assignments.length === 0 ? (
              <p className="text-center py-8 text-gray-600">
                No assignments available
              </p>
            ) : (
              assignments.map((assignment) => (
                <div
                  key={assignment[0]}
                  className="bg-white rounded-lg shadow-md p-4"
                >
                  <div className="flex items-center mb-4">
                    <div className="mx-4">
                      <img src={fileImage} alt="Assignment" className="h-8" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium text-lg">{assignment[1]}</h3>
                      <p className="text-sm text-gray-600">
                        Due: {formatDate(assignment[2])}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewAssignment(assignment[0])}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm"
                        title="View Assignment"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDownloadAssignment(assignment[0])}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded text-sm"
                        title="Download Assignment"
                      >
                        Download
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 border-t pt-4">
                    <h4 className="font-medium mb-2">Submit Your Work</h4>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input
                        id={`fileInput-${assignment[0]}`}
                        type="file"
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                        onChange={handleFileChange}
                        className="border rounded px-3 py-2 flex-grow"
                      />
                      <button
                        onClick={() => handleSubmit(assignment[0])}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded whitespace-nowrap"
                      >
                        Submit
                      </button>
                    </div>
                  </div>

                  {submissions[assignment[0]]?.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="font-medium mb-2">Your Submissions</h4>
                      <div className="space-y-2">
                        {submissions[assignment[0]].map((submission) => (
                          <div
                            key={submission[0]}
                            className="bg-gray-50 p-3 rounded"
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <FaStar
                                  className={`text-lg ${
                                    isSubmissionOnTime(submission[1], assignment[2])
                                      ? "text-green-500"
                                      : "text-red-500"
                                  }`}
                                  title={
                                    isSubmissionOnTime(submission[1], assignment[2])
                                      ? "Submitted on time"
                                      : "Submitted late"
                                  }
                                />
                                <span className="font-medium">
                                  Submitted on: {formatDate(submission[1])}
                                </span>
                              </div>
                              <div className="flex gap-2 items-center">
                                <button
                                  onClick={() =>
                                    handleViewSubmission(submission[0])
                                  }
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                                  title="View Submission"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() =>
                                    handleDownloadSubmission(submission[0])
                                  }
                                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm"
                                  title="Download Submission"
                                >
                                  Download
                                </button>
                                {submission[2] && (
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                    Grade: {submission[2]}
                                  </span>
                                )}
                              </div>
                            </div>
                            {submission[3] && (
                              <div className="mt-2 text-sm bg-yellow-50 p-2 rounded">
                                <span className="font-medium">Feedback: </span>
                                {submission[3]}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudentAssignment;