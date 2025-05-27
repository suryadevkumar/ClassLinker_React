import './textAnimation.css';
import { Link } from 'react-router-dom';

const Front = () => {
  return (
    <div className="flex flex-col px-9 py-14 md:flex-row justify-between items-center bg-gray-100">
      <div className="animated-text text-8xl md:text-9xl font-sans text-center leading-snug">
        <div className="word relative overflow-hidden text-transparent">
          <span className="reveal-text" style={{ color: 'coral' }}>Welcome</span>
        </div>
        <div className="word relative overflow-hidden text-transparent">
          <span className="reveal-text" style={{ color: 'white' }}>To</span>
        </div>
        <div className="word relative overflow-hidden text-transparent">
          <span className="reveal-text" style={{ color: 'green' }}>ClassLinker</span>
        </div>
      </div>

      <div className="login mt-2 flex flex-col justify-between items-center p-8 bg-white shadow-lg rounded-lg space-y-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome to ClassLinker</h2>
          <p>Your ultimate solution for managing classes, attendance, and academic resources.</p>
        </div>

        <div className="flex flex-col items-center space-y-20">
          <Link to="/studentLogin" className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 my-4 rounded-md transition">Student Login</Link>
          <Link to="teacherLogin" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 my-4 rounded-md transition">Teacher Login</Link>
          <Link to="instituteLogin" className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 my-4 rounded-md transition">Institute Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Front;
