import { Link } from 'react-router-dom';
import { FaBook, FaChalkboardTeacher, FaUniversity } from 'react-icons/fa';

const Home = () => {
  return (
    <div className="h-[calc(100vh-8rem)] bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Hero Content */}
        <div className="text-center lg:text-left space-y-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-800 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">ClassLinker</span> 
            <br />Education Ecosystem
          </h1>
          
          <p className="text-lg text-gray-600 max-w-lg mx-auto lg:mx-0">
            Unified platform for students, educators and institutions to collaborate seamlessly.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl">
            {/* Student Login Card */}
            <Link 
              to="/student/login" 
              className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-blue-50 hover:border-blue-100 group"
            >
              <div className="h-12 w-12 mx-auto mb-3 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <FaBook className="h-6 w-6 text-blue-500 group-hover:text-white" />
              </div>
              <h3 className="font-semibold text-gray-800">Students</h3>
              <p className="text-sm text-gray-500 mt-1">Access your learning resources</p>
            </Link>
            
            {/* Teacher Login Card */}
            <Link 
              to="/teacher/login" 
              className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-blue-50 hover:border-blue-100 group"
            >
              <div className="h-12 w-12 mx-auto mb-3 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors">
                <FaChalkboardTeacher className="h-6 w-6 text-green-500 group-hover:text-white" />
              </div>
              <h3 className="font-semibold text-gray-800">Educators</h3>
              <p className="text-sm text-gray-500 mt-1">Manage your classes</p>
            </Link>
            
            {/* Institute Login Card */}
            <Link 
              to="/institute/login" 
              className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-blue-50 hover:border-blue-100 group"
            >
              <div className="h-12 w-12 mx-auto mb-3 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <FaUniversity className="h-6 w-6 text-purple-500 group-hover:text-white" />
              </div>
              <h3 className="font-semibold text-gray-800">Institutes</h3>
              <p className="text-sm text-gray-500 mt-1">Administer your institution</p>
            </Link>
          </div>
        </div>

        {/* Right Side - Illustration */}
        <div className="relative hidden lg:block">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
          
          <div className="relative z-10">
            <img 
              src="https://illustrations.popsy.co/amber/digital-nomad.svg" 
              alt="Education Illustration"
              className="w-full h-auto max-w-md mx-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;