import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import axios from 'axios';
import './index.css'
import Footer from './components/Footer'
import Home from './components/Home'
import Header from './components/Header'
import Error from './components/Error'
import LoginCard from './components/LoginCard'
import InstituteLogin from './components/InstituteLogin'
import StudentSignup from './components/StudentSignup'
import InstituteSignUp from './components/InstituteSignup'
import InstituteDashboard from './components/InstituteDashboard';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import ClassList from './components/ClassList';
import SubjectList from './components/SubjectList';
import { initializeSocket } from './utils/socket.js'
import Chat from './components/Chat';
import ResetPassword from './components/ResetPassword.jsx';
import ChangePassword from './components/ChangePassword.jsx';
import StudentList from './components/StudentList.jsx';
import TeacherSignup from './components/teacherSignup.jsx';
import TeacherList from './components/TeacherList.jsx';
import JoinRequests from './components/JoinRequest.jsx';
import AdminCredentials from './components/AdminCredentials.jsx';
import MarkAttendance from './components/MarkAttendance.jsx';

initializeSocket();

axios.defaults.baseURL = 'http://localhost:3000/api';

const AppLayout =()=> {
  return (
    <>
      <Header/>
      <ToastContainer position="top-center" autoClose={3000}/>
      <Outlet/>
      <Footer/>
    </>
  )
}

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout/>,
    errorElement: <Error/>,
    children: [
      {
        path: "/",
        element: <Home/>
      },
      {
        path: "/instituteSignup",
        element: <InstituteSignUp/>
      },
      {
        path: "/teacherSignup",
        element: <TeacherSignup/>
      },
      {
        path: "/studentSignup",
        element: <StudentSignup/>
      },
      {
        path: "/studentLogin",
        element: <LoginCard login_type="Student"/>,
      },
      {
        path: "/teacherLogin",
        element: <LoginCard login_type="Teacher"/>
      },
      {
        path: "/adminLogin",
        element: <LoginCard login_type="Admin"/>
      },
      {
        path: "/resetPassword",
        element: <ResetPassword/>
      },
      {
        path: "/changePassword",
        element: <ChangePassword/>
      },
      {
        path: "/instituteLogin",
        element: <InstituteLogin/>
      },
      {
        path: "/instituteDashboard",
        element: <InstituteDashboard/>
      },
      {
        path: "/adminDashboard",
        element: <AdminDashboard/>
      },
      {
        path: "/teacherDashboard",
        element: <TeacherDashboard/>
      },
      {
        path: "/studentDashboard",
        element: <StudentDashboard/>
      },
      {
        path: "/admin",
        element: <AdminCredentials/>
      },
      {
        path: "/classList",
        element: <ClassList/>
      },
      {
        path: "/subject",
        element: <SubjectList/>
      },
      {
        path: "/chat",
        element: <Chat/>
      },
      {
        path: "/student",
        element: <StudentList/>
      },
      {
        path: "/teacher",
        element: <TeacherList/>
      },
      {
        path: "/request",
        element: <JoinRequests/>
      },
      {
        path: "/mark/attendance",
        element: <MarkAttendance/>
      }
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={appRouter}/>
  </StrictMode>,
)
