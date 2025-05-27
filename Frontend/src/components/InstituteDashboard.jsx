import { useState, useEffect } from "react"
import adminCredentials from "../assets/img/adminCredentials.png"
import changePass from "../assets/img/changePass.png"
import adminPic from "../assets/img/admin.png"
import managePic from "../assets/img/manage.png"
import { getInstituteDetails } from "../routes/insRoutes.js"
import { Link } from "react-router-dom"

const InstituteDashboard = () => {
    const [instituteData,setInstituteData]=useState("");
        useEffect(()=>{
            getInstituteData();
        },[])
    
    const getInstituteData= async()=>{
        const response=await getInstituteDetails();
        setInstituteData(response);
    }

  return (
    <div className="flex flex-col md:flex-row items-center p-4 bg-gray-100">
      <section className=" bg-white p-6 rounded-lg shadow-lg text-center w-full md:w-[50%] mx-4">
        <img
          src="https://th.bing.com/th/id/OIP.sQdnD9IXz89MFCyQayuVVgHaHa?pid=ImgDet&w=192&h=192&c=7&dpr=1.5"
          alt="Institute Picture"
          className="profile-pic w-36 h-36 rounded-full mx-auto mb-4"
        />
        <h2 className="text-2xl font-semibold">
          <span>{instituteData.name}</span>
        </h2>
        <p className="mt-4 text-lg">
          <b>Institute ID: </b>
          <span>{instituteData.code}</span>
        </p>
        <p className="mt-2 text-lg">
          <b>Email: </b>
          <span>{instituteData.email}</span>
        </p>
        <p className="mt-2 text-lg">
          <b>Mobile No: </b>
          <span>{instituteData.mobile}</span>
        </p>
      </section>

      <div className="menu-box flex flex-col justify-around w-full md:w-[50%] flex-wrap mx-4 mt-8 md:mt-0">
        <div className="menu flex items-center bg-white p-4 rounded-lg shadow-md mb-4">
          <img
            src={adminCredentials}
            alt="admin_credentials"
            className="w-20 h-20 mr-6"
          />
          <h2 className="text-lg font-semibold">
            <a href="admin-credentials.html" className="text-black hover:underline">
              Change Admin Credentials
            </a>
          </h2>
        </div>

        <div className="menu flex items-center bg-white p-4 rounded-lg shadow-md mb-4">
          <img src={changePass} alt="change_password" className="w-20 h-20 mr-6" />
          <h2 className="text-lg font-semibold">Change Password</h2>
        </div>

        <div className="menu flex items-center bg-white p-4 rounded-lg shadow-md mb-4">
          <img src={adminPic} alt="login_admin" className="w-20 h-20 mr-6" />
          <h2 className="text-lg font-semibold">
            <Link to="/adminDashboard" className="text-black hover:underline">
              Login as Administrator
            </Link>
          </h2>
        </div>

        <div className="menu flex items-center bg-white p-4 rounded-lg shadow-md">
          <img src={managePic} alt="departments" className="w-20 h-20 mr-6" />
          <h2 className="text-lg font-semibold">Manage Institute</h2>
        </div>
      </div>
    </div>
  );
};

export default InstituteDashboard;