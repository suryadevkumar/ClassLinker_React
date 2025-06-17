import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { fetchStudentDetails } from '../routes/studentRoutes';
import { fetchAttendanceDetails } from '../routes/attendanceRoutes';
import { useLocation } from 'react-router-dom';

const StudentAttendance = () => {
    const location = useLocation();
  const [subId, setSubId] = useState('');
  const [subName, setSubName] = useState('');
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState({
    records: [], 
    totalClasses: 0,
    totalPresent: 0
  });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState('');

  useEffect(() => {
    const initializeAttendanceSheet = async () => {
      try {
        setSubId(location.state?.subjectId);
        setSubName(location.state?.subjectName);

        // Fetch student details
        const studentData = await fetchStudentDetails();
        setStudent(studentData);

        // Fetch attendance details
        const attendanceData = await fetchAttendanceDetails(subId);
        setAttendance({
          records: attendanceData.attendences || [],  // Ensure array exists
          totalClasses: attendanceData.totalClasses || 0,
          totalPresent: attendanceData.totalPresent || 0
        });

      } catch (error) {
        toast.error('Failed to load attendance data');
        console.error(error);
        // Initialize with empty data if error occurs
        setAttendance({
          records: [],
          totalClasses: 0,
          totalPresent: 0
        });
      } finally {
        setLoading(false);
      }
    };

    initializeAttendanceSheet();
  }, [subId]);

  const openImageModal = (imageSrc) => {
    setModalImage(imageSrc);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-8rem)] pt-20 bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Calculate attendance percentage
  const attendancePercentage = attendance.totalClasses > 0 
    ? ((attendance.totalPresent / attendance.totalClasses) * 100).toFixed(2)
    : 0;

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-4">
        {/* Heading */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 text-center">
            Attendance Sheet (<span className="text-indigo-600">{subName}</span>)
          </h2>
        </div>

        {/* Container */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Student Info Card */}
          <div className="w-full lg:w-1/3">
            {student && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Student Image */}
                <div className="flex justify-center p-6">
                  <img 
                    src={`data:image/png;base64,${student.std_pic}`} 
                    alt="Student" 
                    className="w-40 h-40 object-cover rounded-full border-4 border-indigo-100 cursor-pointer"
                    onClick={() => openImageModal(`data:image/png;base64,${student.std_pic}`)}
                  />
                </div>

                {/* Student Info */}
                <div className="px-6 pb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                    Student Information
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium text-gray-600">Scholar ID:</span>
                      <span className="text-gray-800">{student.sch_id}</span>
                    </div>
                    
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium text-gray-600">Name:</span>
                      <span className="text-gray-800">{student.std_name}</span>
                    </div>
                    
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium text-gray-600">Percentage:</span>
                      <span className="text-gray-800">
                        {attendancePercentage}%
                      </span>
                    </div>
                  </div>

                  {/* Attendance Circle */}
                  <div className="mt-6 flex flex-col items-center">
                    <div 
                      className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center mb-3
                        ${attendancePercentage < 75 ? 
                          'border-red-500 text-red-500' : 
                          'border-green-500 text-green-500'}`}
                    >
                      <p className="text-sm font-medium">Present</p>
                      <p className="text-xl font-bold my-1">
                        {attendance.totalPresent}/{attendance.totalClasses}
                      </p>
                      <p className="text-sm font-medium">Total days</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Attendance List */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-indigo-600 text-white">
                    <tr>
                      <th className="py-3 px-4 text-left">Sr No.</th>
                      <th className="py-3 px-4 text-left">Date</th>
                      <th className="py-3 px-4 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {attendance.records && attendance.records.length > 0 ? (
                      attendance.records.map((record, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-3 px-4">{index + 1}</td>
                          <td className="py-3 px-4">{record[0]}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-block py-1 px-3 rounded-full text-xs font-medium
                              ${record[1] === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                            >
                              {record[1]}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="py-4 text-center text-gray-500">
                          No attendance records found
                        </td>
                      </tr>
                    )}
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

export default StudentAttendance;