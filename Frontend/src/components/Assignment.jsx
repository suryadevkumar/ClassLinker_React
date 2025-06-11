import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getAssignmentList,
  uploadAssignment,
  downloadAssignment,
  deleteAssignment,
} from "../routes/assignmentRoutes";
import fileImage from "../assets/img/file.png";

const Assignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [file, setFile] = useState(null);
  const subId = sessionStorage.getItem("sub_id");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const assignmentList = await getAssignmentList(subId);
        setAssignments(assignmentList);
      } catch (error) {
        toast.error("Failed to load assignments");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [subId]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
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

  const handleDelete = async (assignmentId) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      try {
        await deleteAssignment(assignmentId);
        toast.success("Assignment deleted successfully");

        // Refresh assignments list
        const assignmentList = await getAssignmentList(subId);
        setAssignments(assignmentList);
      } catch (error) {
        toast.error("Error deleting assignment");
      }
    }
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

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Upload Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 w-full md:w-1/2 mx-auto">
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
                accept=".pdf,.docx,.txt,.jpeg,.jpg"
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

        {/* Assignments List */}
        <div className="w-full md:w-2/3 mx-auto">
          <h2 className="text-2xl font-bold mb-4">Assignments List</h2>
          {assignments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <p className="text-gray-500">No assignments available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment, index) => (
                <div
                  key={assignment[0]}
                  className="bg-white rounded-xl shadow-lg p-4 flex items-center"
                >
                  <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-4">
                    {index + 1}
                  </div>
                  <div className="mx-4">
                    <img src={fileImage} alt="Assignment" className="w-8 h-8" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold">{assignment[1]}</h3>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDownload(assignment[0])}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(assignment[0])}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Assignment;
