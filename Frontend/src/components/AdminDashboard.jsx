import { useState,useEffect } from "react"
import { jpgImg } from "../config/config.js"
import student_img from "../assets/img/student.png"
import teacher_img from "../assets/img/teacher.png"
import request_img from "../assets/img/request.png"
import class_img from "../assets/img/class.png"
import { getAdminDetails } from "../routes/adminRoutes.js"
import { Link } from "react-router-dom"

const AdminDashboard = () => {

  const [adminData, setAdminData] = useState({});
  
  useEffect(()=>{
    const getAdminDetail=async()=>{
    const response = await getAdminDetails();
    setAdminData(response);
  }
    getAdminDetail();
  },[])

  return (
    <div className="flex flex-col lg:flex-row bg-gray-100">
      <section className="w-[95%] m-4 flex flex-col items-center text-center p-5 bg-white rounded-lg">
        <img src={jpgImg + adminData.adminPic} alt="Profile Picture" className="rounded-full w-52 h-52 mb-4" />
        <h2 className="text-2xl font-bold mb-4">{adminData.adminName}</h2>
        <p className="mb-4"><strong>College Name: </strong>{adminData.instituteName}</p>
        <p className="mb-4"><strong>Email id: </strong>{adminData.adminEmail}</p>
        <p className="mb-4"><strong>Mobile no: </strong>{adminData.adminMobile}</p>
      </section>

      <div className="flex flex-wrap justify-around w-full items-center">
        <div className="w-56 h-40 p-2 m-5 bg-white text-center rounded-lg">
          <h2 className="mb-3 text-lg font-bold">Student</h2>
          <Link to="/student">
            <img src={student_img} alt="Student" className="h-3/5 mx-auto" />
          </Link>
        </div>
        <div className="w-56 h-40 p-2 m-5 bg-white text-center rounded-lg">
          <h2 className="mb-3 text-lg font-bold">Teacher</h2>
          <a href="teacherList.html">
            <img src={teacher_img} alt="Teacher" className="h-3/5 mx-auto" />
          </a>
        </div>
        <div className="w-56 h-40 p-2 m-5 bg-white text-center rounded-lg">
          <h2 className="mb-3 text-lg font-bold">Request</h2>
          <a href="join-request.html">
            <img src={request_img} alt="Request" className="h-3/5 mx-auto" />
          </a>
        </div>
        <div className="w-56 h-40 p-2 m-5 bg-white text-center rounded-lg">
          <h2 className="mb-3 text-lg font-bold">Class</h2>
          <Link to="/classList">
            <img src={class_img} alt="Class" className="h-3/5 mx-auto" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
