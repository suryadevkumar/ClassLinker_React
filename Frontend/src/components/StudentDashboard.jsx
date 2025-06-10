import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import attendence from '../assets/img/attendance.png';
import notes from '../assets/img/notes.png';
import assignment from '../assets/img/assignment.png';
import chat from '../assets/img/chat.png';
import video from '../assets/img/video.png';
import changePass from '../assets/img/changePass.png';
import { fetchStudentDetails, fetchSubjectList } from '../routes/studentRoutes';
import { useNavigate } from 'react-router-dom';
import UnverifiedCard from './UnverifiedCard';

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const navigate = useNavigate();

  // Load student data on component mount
  useEffect(() => {
    const loadStudentData = async () => {
      try {
        const data = await fetchStudentDetails();
        if (data.verified === "Verified") {
          setIsVerified(true);
          setStudentData(data);
          sessionStorage.setItem('user_id1', data.std_id);
        }
      } catch (error) {
        toast.error('Failed to load student data');
      } finally {
        setLoading(false);
      }
    };
    loadStudentData();
  }, []);

  // Handle subject selection for different modals
  const handleSubjectSelect = async (modalType) => {
    try {
      const data = await fetchSubjectList();
      console.log(data);
      setSubjects(data);
      setShowModal(modalType);
    } catch (error) {
      toast.error('Failed to load subjects');
    }
  };

  // Handle navigation to different pages
const handleNavigation = (page) => {
  if (!selectedSubject) {
    toast.error('Please select a subject');
    return;
  }

  // No need to find in subjects array since we already have the complete subject
  sessionStorage.setItem('sub_id', selectedSubject[0]);  // Subject ID
  sessionStorage.setItem('sub_name', selectedSubject[1]); // Subject name

  console.log('Stored subject:', {
    id: selectedSubject[0],
    name: selectedSubject[1]
  });

  switch (page) {
    case 'attendance':
      navigate('/student-attendance-sheet');
      break;
    case 'notes':
      navigate('/student-notes');
      break;
    case 'assignment':
      navigate('/student-assignment');
      break;
    case 'chat':
      navigate('/chat-student');
      break;
    case 'lectures':
      navigate('/student-lectures');
      break;
    default:
      break;
  }

  setShowModal(null);
  setSelectedSubject(null);
};

  // Handle logout
  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/student-login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-amber-50 to-pink-200 flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <UnverifiedCard/>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-amber-50 to-pink-200 flex flex-col">

      {/* Main Content */}
      <main className="flex-grow flex flex-col md:flex-row p-4 gap-4">
        {/* Profile Info */}
        <div className="bg-white rounded-lg shadow-md p-6 w-full md:w-1/2">
          <div className="text-center">
            <img 
              src={`data:image/jpeg;base64,${studentData.std_pic}`} 
              alt="Profile" 
              className="w-40 h-40 rounded-full mx-auto mb-4 object-cover"
            />
            <h2 className="text-2xl font-bold">{studentData.std_name}</h2>
          </div>
          
          <div className="mt-6 space-y-3">
            <p><span className="font-semibold">Scholar ID:</span> {studentData.sch_id}</p>
            <p><span className="font-semibold">College Name:</span> {studentData.ins_name}</p>
            <p><span className="font-semibold">Email:</span> {studentData.std_email}</p>
            <p><span className="font-semibold">Mobile No:</span> {studentData.std_mobile}</p>
            <p><span className="font-semibold">Department:</span> {studentData.dep_name}</p>
            <p><span className="font-semibold">Course:</span> {studentData.crs_name}</p>
            <p><span className="font-semibold">Class:</span> {studentData.cls_name}</p>
            <p><span className="font-semibold">Section:</span> {studentData.section}</p>
          </div>
        </div>

        {/* Menu Options */}
        <div className="w-full md:w-1/2 grid grid-cols-1 gap-4">
          <div 
            className="bg-white rounded-lg shadow-md p-4 flex items-center cursor-pointer hover:bg-gray-50 transition"
            onClick={() => handleSubjectSelect('attendance')}
          >
            <img src={attendence} alt="Attendance" className="w-16 h-16 mr-4" />
            <h2 className="text-xl font-semibold">View Attendance</h2>
          </div>

          <div 
            className="bg-white rounded-lg shadow-md p-4 flex items-center cursor-pointer hover:bg-gray-50 transition"
            onClick={() => handleSubjectSelect('notes')}
          >
            <img src={notes} alt="Notes" className="w-16 h-16 mr-4" />
            <h2 className="text-xl font-semibold">Download Notes</h2>
          </div>

          <div 
            className="bg-white rounded-lg shadow-md p-4 flex items-center cursor-pointer hover:bg-gray-50 transition"
            onClick={() => handleSubjectSelect('lectures')}
          >
            <img src={video} alt="Videos" className="w-16 h-16 mr-4" />
            <h2 className="text-xl font-semibold">Watch Lectures</h2>
          </div>

          <div 
            className="bg-white rounded-lg shadow-md p-4 flex items-center cursor-pointer hover:bg-gray-50 transition"
            onClick={() => handleSubjectSelect('assignment')}
          >
            <img src={assignment} alt="Assignment" className="w-16 h-16 mr-4" />
            <h2 className="text-xl font-semibold">Download Assignments</h2>
          </div>

          <div 
            className="bg-white rounded-lg shadow-md p-4 flex items-center cursor-pointer hover:bg-gray-50 transition"
            onClick={() => handleSubjectSelect('chat')}
          >
            <img src={chat} alt="Chat" className="w-16 h-16 mr-4" />
            <h2 className="text-xl font-semibold">Group Chat</h2>
          </div>

          <div 
            className="bg-white rounded-lg shadow-md p-4 flex items-center cursor-pointer hover:bg-gray-50 transition"
            onClick={() => navigate('/changePassword')}
          >
            <img src={changePass} alt="Change Password" className="w-16 h-16 mr-4" />
            <h2 className="text-xl font-semibold">Change Password</h2>
          </div>
        </div>
      </main>

      {/* Subject Selection Modals */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Select Subject</h2>
            
            <select
              className="w-full p-2 border rounded mb-4"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(JSON.parse(e.target.value))}
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject[0]} value={JSON.stringify(subject)}>
                  {subject[1]}
                </option>
              ))}
            </select>

            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                onClick={() => handleNavigation(showModal)}
              >
                Select
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                onClick={() => {
                  setShowModal(null);
                  setSelectedSubject('');
                }}
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

export default StudentDashboard;