import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import axios from "axios";
import "./index.css";

import { initializeSocket } from "./utils/socket.js";

import Header from "./components/Header";
import Front from "./components/Front.jsx";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Error from "./components/Error";
import LoginCard from "./components/LoginCard";
import InstituteLogin from "./components/InstituteLogin";
import StudentSignup from "./components/StudentSignup";
import InstituteSignUp from "./components/InstituteSignup";
import InstituteDashboard from "./components/InstituteDashboard";
import AdminDashboard from "./components/AdminDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import StudentDashboard from "./components/StudentDashboard";
import ClassList from "./components/ClassList";
import SubjectList from "./components/SubjectList";
import Chat from "./components/Chat";
import ResetPassword from "./components/ResetPassword.jsx";
import ChangePassword from "./components/ChangePassword.jsx";
import StudentList from "./components/StudentList.jsx";
import TeacherSignup from "./components/teacherSignup.jsx";
import TeacherList from "./components/TeacherList.jsx";
import JoinRequests from "./components/JoinRequest.jsx";
import AdminCredentials from "./components/AdminCredentials.jsx";
import MarkAttendance from "./components/MarkAttendance.jsx";
import Notes from "./components/Notes.jsx";
import Assignment from "./components/Assignment.jsx";
import Lectures from "./components/Lecture.jsx";
import StudentAttendance from "./components/StudentAttendance.jsx";

initializeSocket();

axios.defaults.baseURL = "http://localhost:3000/api";
axios.defaults.withCredentials = true;

const AppLayout = () => {
  return (
    <>
      <Header />
      <ToastContainer position="top-center" autoClose={3000} />
      <Front />
      <Footer />
    </>
  );
};

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <Error />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/institute/signup",
        element: <InstituteSignUp />,
      },
      {
        path: "/teacher/signup",
        element: <TeacherSignup />,
      },
      {
        path: "/student/signup",
        element: <StudentSignup />,
      },
      {
        path: "/student/login",
        element: <LoginCard login_type="Student" />,
      },
      {
        path: "/teacher/login",
        element: <LoginCard login_type="Teacher" />,
      },
      {
        path: "/admin/login",
        element: <LoginCard login_type="Admin" />,
      },
      {
        path: "/institute/login",
        element: <InstituteLogin />,
      },
      {
        path: "/reset/password",
        element: <ResetPassword />,
      },
      {
        path: "/change/password",
        element: <ChangePassword />,
      },
      {
        path: "/institute/dashboard",
        element: <InstituteDashboard />,
      },
      {
        path: "/admin/dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "/teacher/dashboard",
        element: <TeacherDashboard />,
      },
      {
        path: "/student/dashboard",
        element: <StudentDashboard />,
      },
      {
        path: "/admin",
        element: <AdminCredentials />,
      },
      {
        path: "/class/list",
        element: <ClassList />,
      },
      {
        path: "/subject",
        element: <SubjectList />,
      },
      {
        path: "/chat",
        element: <Chat />,
      },
      {
        path: "/student",
        element: <StudentList />,
      },
      {
        path: "/teacher",
        element: <TeacherList />,
      },
      {
        path: "/request",
        element: <JoinRequests />,
      },
      {
        path: "/mark/attendance",
        element: <MarkAttendance />,
      },
      {
        path: "/notes",
        element: <Notes />,
      },
      {
        path: "/assignment",
        element: <Assignment />,
      },
      {
        path: "/lecture",
        element: <Lectures />,
      },
      {
        path: "/student/attendance",
        element: <StudentAttendance />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={appRouter} />
  </StrictMode>
);
