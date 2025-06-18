import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUserCog, FaKey, FaSignInAlt, FaBuilding, FaIdCard } from 'react-icons/fa';
import { getInstituteDetails } from '../routes/insRoutes';
import { Link } from 'react-router-dom';

const InstituteDashboard = () => {
  const [instituteData, setInstituteData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInstituteData = async () => {
      try {
        const response = await getInstituteDetails();
        setInstituteData(response);
      } catch (error) {
        toast.error('Failed to load institute data');
      } finally {
        setLoading(false);
      }
    };
    loadInstituteData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-pulse text-2xl text-indigo-600">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-800">Institute Dashboard</h1>
          <p className="text-indigo-600 mt-2">Welcome, {instituteData?.name}</p>
        </header>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden lg:w-3/5">
            <div className="bg-indigo-600 p-4 text-white text-center">
              <h2 className="text-xl font-semibold">Institute Profile</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 rounded-full border-4 border-indigo-100 overflow-hidden mb-4 bg-indigo-50 flex items-center justify-center">
                  <FaBuilding className="text-indigo-600 text-5xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">{instituteData.name}</h3>
                <p className="text-indigo-600">{instituteData.code}</p>
              </div>

              <div className="space-y-4">
                <ProfileItem label="Institute ID" value={instituteData.code} />
                <ProfileItem label="Email" value={instituteData.email} />
                <ProfileItem label="Mobile" value={instituteData.mobile} />
              </div>
            </div>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:w-2/3">
            <Link to="/admin" className="block">
              <DashboardCard 
                icon={<FaUserCog className="text-indigo-600 text-3xl" />}
                title="Change Admin Credentials"
                color="bg-indigo-50"
              />
            </Link>
            <Link 
              to="/changePassword" 
              state={{ userType: "Institute" }}
              className="block"
            >
              <DashboardCard 
                icon={<FaKey className="text-indigo-600 text-3xl" />}
                title="Change Password"
                color="bg-indigo-50"
              />
            </Link>
            <Link to="/adminDashboard" className="block">
              <DashboardCard 
                icon={<FaSignInAlt className="text-indigo-600 text-3xl" />}
                title="Login as Administrator"
                color="bg-indigo-50"
              />
            </Link>
            <div className="block">
              <DashboardCard 
                icon={<FaIdCard className="text-indigo-600 text-3xl" />}
                title="Manage Institute"
                color="bg-indigo-50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Profile Item Component (same as in Admin Dashboard)
const ProfileItem = ({ label, value }) => (
  <div className="flex items-start">
    <span className="font-medium text-gray-700 min-w-[120px]">{label}:</span>
    <span className="text-gray-600">{value}</span>
  </div>
);

// Reusable Dashboard Card Component (same as in Admin Dashboard)
const DashboardCard = ({ icon, title, onClick, color }) => (
  <div 
    className={`${color} rounded-xl shadow-md p-6 flex flex-col items-center cursor-pointer hover:shadow-lg transition-all duration-300 h-full`}
    onClick={onClick}
  >
    <div className="mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-center text-gray-800">{title}</h3>
  </div>
);

export default InstituteDashboard;