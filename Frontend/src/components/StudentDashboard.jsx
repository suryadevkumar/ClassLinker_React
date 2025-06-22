import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaClipboardCheck, FaBook, FaVideo, FaTasks, FaComments, FaKey } from 'react-icons/fa';
import { fetchStudentDetails, fetchSubjectList } from '../routes/studentRoutes';
import { Link, useNavigate } from 'react-router-dom';
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

    const navigationMap = {
      'attendance': '/student/attendance',
      'notes': '/notes',
      'assignment': '/assignment',
      'chat': '/chat',
      'lectures': '/lecture'
    };

    const stateMap = {
      'attendance': { subjectId: selectedSubject[0], subjectName: selectedSubject[1] },
      'notes': { subjectId: selectedSubject[0], subjectName: selectedSubject[1] },
      'assignment': { userType: "student", studentId: studentData.std_id, subjectId: selectedSubject[0], subjectName: selectedSubject[1] },
      'chat': { userType: "student", subjectId: selectedSubject[0], userName: studentData.std_name, userId: studentData.std_id },
      'lectures': { userType: "student", subjectId: selectedSubject[0], subjectName: selectedSubject[1] }
    };

    navigate(navigationMap[page], { state: stateMap[page] });
    setShowModal(null);
    setSelectedSubject('');
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-pulse text-2xl text-indigo-600">Loading your dashboard...</div>
      </div>
    );
  }

  if (!isVerified) {
    return <UnverifiedCard />;
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] py-2 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-800">Student Dashboard</h1>
          <p className="text-indigo-600 mt-2">Welcome, {studentData?.std_name}</p>
        </header>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden lg:w-3/5">
            <div className="bg-indigo-600 p-4 text-white text-center">
              <h2 className="text-xl font-semibold">Student Profile</h2>
            </div>
            <div className="px-6 py-4">
              <div className="flex flex-col items-center mb-2">
                <div className="w-32 h-32 rounded-full border-4 border-indigo-100 overflow-hidden mb-2">
                  <img
                    src={`data:image/jpeg;base64,${studentData.std_pic}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-800">{studentData.std_name}</h3>
                <p className="text-indigo-600">{studentData.sch_id}</p>
              </div>

              <div className="space-y-4">
                <ProfileItem label="College" value={studentData.ins_name} />
                <ProfileItem label="Email" value={studentData.std_email} />
                <ProfileItem label="Mobile" value={studentData.std_mobile} />
                <ProfileItem label="Department" value={studentData.dep_name} />
                <ProfileItem label="Course" value={studentData.crs_name} />
                <ProfileItem label="Class" value={`${studentData.cls_name} (${studentData.section})`} />
              </div>
            </div>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:w-2/3">
            <DashboardCard 
              icon={<FaClipboardCheck className="text-indigo-600 text-3xl" />}
              title="View Attendance"
              onClick={() => handleSubjectSelect('attendance')}
              color="bg-indigo-50"
            />
            <DashboardCard 
              icon={<FaBook className="text-indigo-600 text-3xl" />}
              title="Download Notes"
              onClick={() => handleSubjectSelect('notes')}
              color="bg-indigo-50"
            />
            <DashboardCard 
              icon={<FaVideo className="text-indigo-600 text-3xl" />}
              title="Watch Lectures"
              onClick={() => handleSubjectSelect('lectures')}
              color="bg-indigo-50"
            />
            <DashboardCard 
              icon={<FaTasks className="text-indigo-600 text-3xl" />}
              title="Assignments"
              onClick={() => handleSubjectSelect('assignment')}
              color="bg-indigo-50"
            />
            <DashboardCard 
              icon={<FaComments className="text-indigo-600 text-3xl" />}
              title="Group Chat"
              onClick={() => handleSubjectSelect('chat')}
              color="bg-indigo-50"
            />
            <Link 
              to="/change/password" 
              state={{ userType: "Student" }}
              className="block"
            >
              <DashboardCard 
                icon={<FaKey className="text-indigo-600 text-3xl" />}
                title="Change Password"
                color="bg-indigo-50"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Subject Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-indigo-600 p-4 text-white">
              <h3 className="text-xl font-semibold">
                {showModal === 'attendance' && 'View Attendance'}
                {showModal === 'notes' && 'Download Notes'}
                {showModal === 'lectures' && 'Watch Lectures'}
                {showModal === 'assignment' && 'Assignments'}
                {showModal === 'chat' && 'Group Chat'}
              </h3>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Select Subject</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(JSON.parse(e.target.value))}
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject[0]} value={JSON.stringify(subject)}>
                      {subject[1]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                  onClick={() => {
                    setShowModal(null);
                    setSelectedSubject('');
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                  onClick={() => handleNavigation(showModal)}
                  disabled={!selectedSubject}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Profile Item Component
const ProfileItem = ({ label, value }) => (
  <div className="flex items-start">
    <span className="font-medium text-gray-700 min-w-[120px]">{label}:</span>
    <span className="text-gray-600">{value}</span>
  </div>
);

// Reusable Dashboard Card Component
const DashboardCard = ({ icon, title, onClick, color }) => (
  <div 
    className={`${color} rounded-xl shadow-md p-6 flex flex-col items-center cursor-pointer hover:shadow-lg transition-all duration-300 h-full`}
    onClick={onClick}
  >
    <div className="mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-center text-gray-800">{title}</h3>
  </div>
);

export default StudentDashboard;