import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUserGraduate, FaChalkboardTeacher, FaEnvelope, FaUsers, FaKey } from 'react-icons/fa';
import { getAdminDetails } from '../routes/adminRoutes';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const response = await getAdminDetails();
        setAdminData(response);
      } catch (error) {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    loadAdminData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-pulse text-2xl text-indigo-600">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] py-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-800">Admin Dashboard</h1>
          <p className="text-indigo-600 mt-2">Welcome, {adminData?.adminName}</p>
        </header>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden lg:w-3/5">
            <div className="bg-indigo-600 p-4 text-white text-center">
              <h2 className="text-xl font-semibold">Admin Profile</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 rounded-full border-4 border-indigo-100 overflow-hidden mb-4">
                  <img
                    src={`data:image/jpeg;base64,${adminData.adminPic}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-800">{adminData.adminName}</h3>
              </div>

              <div className="space-y-4">
                <ProfileItem label="College" value={adminData.instituteName} />
                <ProfileItem label="Email" value={adminData.adminEmail} />
                <ProfileItem label="Mobile" value={adminData.adminMobile} />
              </div>
            </div>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:w-2/3">
            <Link to="/student" className="block">
              <DashboardCard 
                icon={<FaUserGraduate className="text-indigo-600 text-3xl" />}
                title="Student Management"
                color="bg-indigo-50"
              />
            </Link>
            <Link to="/teacher" className="block">
              <DashboardCard 
                icon={<FaChalkboardTeacher className="text-indigo-600 text-3xl" />}
                title="Teacher Management"
                color="bg-indigo-50"
              />
            </Link>
            <Link to="/request" className="block">
              <DashboardCard 
                icon={<FaEnvelope className="text-indigo-600 text-3xl" />}
                title="Verification Requests"
                color="bg-indigo-50"
              />
            </Link>
            <Link to="/class/list" className="block">
              <DashboardCard 
                icon={<FaUsers className="text-indigo-600 text-3xl" />}
                title="Class Management"
                color="bg-indigo-50"
              />
            </Link>
          </div>
        </div>
      </div>
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

export default AdminDashboard;