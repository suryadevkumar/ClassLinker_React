import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import attendence from '../assets/img/attendance.png';
import notes from '../assets/img/notes.png';
import assignment from '../assets/img/assignment.png';
import fileImage from '../assets/img/file.png';
import chat from '../assets/img/chat.png';
import video from '../assets/img/video.png';
import changePass from '../assets/img/changePass.png';
import { fetchTeacherDetails, fetchSubjectList } from '../routes/teacherRoutes';
import { Link, useNavigate } from 'react-router-dom';
import UnverifiedCard from './UnverifiedCard';

const TeacherDashboard = () => {
  const [teacherData, setTeacherData] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const navigate = useNavigate();

  // Load teacher data on component mount
  useEffect(() => {
    const loadTeacherData = async () => {
      try {
        const data = await fetchTeacherDetails();
        if (data.verified === "Verified") {
          setIsVerified(true);
          setTeacherData(data);
          sessionStorage.setItem('user_id', data.user_id);
        }
      } catch (error) {
        toast.error('Failed to load teacher data');
      } finally {
        setLoading(false);
      }
    };
    loadTeacherData();
  }, []);

  // Handle subject selection for different modals
  const handleSubjectSelect = async (modalType) => {
    try {
      const data = await fetchSubjectList();
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

    switch (page) {
      case 'view-student-assignment':
        navigate('/view/assignment', {state: {'subjectId': selectedSubject}});
        break;
      case 'attendance':
        navigate('/mark/attendance', {state: {'subjectId': selectedSubject}});
        break;
      case 'notes':
        navigate('/notes', {state: {'userType': 'teacher', 'subjectId': selectedSubject}});
        break;
      case 'assignment':
        navigate('/assignment', {state: {'userType': 'teacher', 'subjectId': selectedSubject}});
        break;
      case 'chat':
        navigate('/chat');
        break;
      case 'lectures':
        navigate('/lecture', {state: {'subjectId': selectedSubject}});
        break;
      default:
        break;
    }

    setShowModal(null);
    setSelectedSubject('');
  };

  // Handle logout
  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/teacher-login');
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
              src={`data:image/jpeg;base64,${teacherData.tch_pic}`} 
              alt="Profile" 
              className="w-40 h-40 rounded-full mx-auto mb-4 object-cover"
            />
            <h2 className="text-2xl font-bold">{teacherData.tch_name}</h2>
          </div>
          
          <div className="mt-6 space-y-3">
            <p><span className="font-semibold">Teacher ID:</span> {teacherData.tch_id}</p>
            <p><span className="font-semibold">College Name:</span> {teacherData.ins_name}</p>
            <p><span className="font-semibold">Email:</span> {teacherData.tch_email}</p>
            <p><span className="font-semibold">Mobile:</span> {teacherData.tch_mobile}</p>
          </div>
        </div>

        {/* Menu Options */}
        <div className="w-full md:w-1/2 grid grid-cols-1 gap-4">
          <div 
            className="bg-white rounded-lg shadow-md p-4 flex items-center cursor-pointer hover:bg-gray-50 transition"
            onClick={() => handleSubjectSelect('attendance')}
          >
            <img src={attendence} alt="Attendance" className="w-16 h-16 mr-4" />
            <h2 className="text-xl font-semibold">Mark Attendance</h2>
          </div>

          <div 
            className="bg-white rounded-lg shadow-md p-4 flex items-center cursor-pointer hover:bg-gray-50 transition"
            onClick={() => handleSubjectSelect('notes')}
          >
            <img src={notes} alt="Notes" className="w-16 h-16 mr-4" />
            <h2 className="text-xl font-semibold">Upload Notes</h2>
          </div>

          <div 
            className="bg-white rounded-lg shadow-md p-4 flex items-center cursor-pointer hover:bg-gray-50 transition"
            onClick={() => handleSubjectSelect('lectures')}
          >
            <img src={video} alt="Notes" className="w-16 h-16 mr-4" />
            <h2 className="text-xl font-semibold">Upload Lectures</h2>
          </div>

          <div 
            className="bg-white rounded-lg shadow-md p-4 flex items-center cursor-pointer hover:bg-gray-50 transition"
            onClick={() => handleSubjectSelect('assignment')}
          >
            <img src={assignment} alt="Assignment" className="w-16 h-16 mr-4" />
            <h2 className="text-xl font-semibold">Upload Assignments</h2>
          </div>

          <div 
            className="bg-white rounded-lg shadow-md p-4 flex items-center cursor-pointer hover:bg-gray-50 transition"
            onClick={() => handleSubjectSelect('view-student-assignment')}
          >
            <img src={fileImage} alt="Assignment" className="w-16 h-16 mr-4" />
            <h2 className="text-xl font-semibold">View Submitted Assignments</h2>
          </div>

          <div 
            className="bg-white rounded-lg shadow-md p-4 flex items-center cursor-pointer hover:bg-gray-50 transition"
            onClick={() => handleSubjectSelect('chat')}
          >
            <img src={chat} alt="Chat" className="w-16 h-16 mr-4" />
            <h2 className="text-xl font-semibold">Group Chat</h2>
          </div>

          <Link to="/changePassword"
                  state={{ userType: "Teacher" }}
            className="bg-white rounded-lg shadow-md p-4 flex items-center cursor-pointer hover:bg-gray-50 transition"
          >
            <img src={changePass} alt="Change Password" className="w-16 h-16 mr-4" />
            <h2 className="text-xl font-semibold">Change Password</h2>
          </Link>
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
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject[0]} value={subject[0]}>
                  {`${subject[1]}, ${subject[2]}, ${subject[3]}, ${subject[4]}`}
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

export default TeacherDashboard;