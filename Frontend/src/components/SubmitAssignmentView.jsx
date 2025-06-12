
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getSubmittedAssignments, viewStudentAssignment } from '../routes/assignmentRoutes';
import fileImage from '../assets/img/file.png';

const SubmitAssignmentView = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModal, setViewModal] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        const sub_id = location.state?.subjectId;
        if (!sub_id) {
          toast.error('No subject selected');
          navigate('/teacher-dashboard');
          return;
        }

        const data = await getSubmittedAssignments(sub_id);
        setSubmissions(data);
      } catch (error) {
        toast.error('Failed to load submissions');
        console.error('Error loading submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
  }, [navigate]);

  const handleViewAssignment = async (submitId) => {
    try {
        console.log(submitId);
      const response = await viewStudentAssignment(submitId);
      setViewModal({
        fileUrl: URL.createObjectURL(new Blob([response.data], { type: response.contentType })),
        fileName: response.fileName
      });
    } catch (error) {
      toast.error('Failed to view assignment');
      console.error('Error viewing assignment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-amber-50 to-pink-200 flex items-center justify-center">
        <div className="text-2xl">Loading submissions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-amber-50 to-pink-200 p-6">

      {/* Header */}
      <div className="flex items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Submitted Assignments</h1>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {submissions.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            No assignments submitted yet for this subject
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted On</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <tr key={submission.SUBMIT_ID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {submission[1]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {submission[2]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {submission[3]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(submission[4]).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {submission[5] ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                          {submission[5]}
                        </span>
                      ) : (
                        <span className="text-gray-500">Not graded</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewAssignment(submission[0])}
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

      {/* View Assignment Modal */}
      {viewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-bold">{viewModal.fileName}</h2>
              <button
                onClick={() => {
                  URL.revokeObjectURL(viewModal.fileUrl);
                  setViewModal(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex-grow overflow-auto p-4">
              {viewModal.fileName ? (
                <iframe 
                  src={viewModal.fileUrl} 
                  className="w-full h-full min-h-[70vh]" 
                  title="Assignment Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">
                    Preview not available for this file type. Please download to view.
                  </p>
                </div>
              )}
            </div>
            <div className="border-t p-4 flex justify-end">
              <a
                href={viewModal.fileUrl}
                download={viewModal.fileName}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmitAssignmentView;