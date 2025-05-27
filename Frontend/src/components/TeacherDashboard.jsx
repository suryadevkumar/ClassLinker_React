import { useState,useEffect } from "react";
import { api, jpgImg } from "../config/config.js"
import UnverifiedCard from "./UnverifiedCard";
import attendance_img from "../assets/img/attendance.png";
import notes_img from "../assets/img/notes.png";
import assignment_img from "../assets/img/assignment.png";
import chat_img from "../assets/img/chat.png";


const TeacherDashboard=()=>{
  const [verified, setVerified] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [teacherData, setTeacherData] = useState({});
  const [subject, setSubject] = useState("");
  
  useEffect(()=>{
    getTeacherDetails();
  },[])

  const getTeacherDetails=async()=>{
    const response = await fetch(api+'/teacherDetailsFetch',{
        method: 'GET',
        credentials: 'include'
    })
    const data=await response.json();
    console.log(data);
    if(data.verified==1){
        setVerified(true);
        setTeacherData(data);
    }
  }

  const handleModalOpen = (modalType) => {
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const selectMenu = (e)=>{
    e.preventDefault();
    if(!subject){
        alert("Please Select Your Subject!")
        return;
    }
    console.log(subject);
  }

  return (
    <>
        {!verified ? <UnverifiedCard/> :
        <div className="bg-gray-100 flex flex-col lg:flex-row items-center mx-auto w-full px-4 lg:px-0">
            <section className="bg-white m-4 p-6 rounded-lg text-center w-full lg:w-[100%]">
                <img src={jpgImg + teacherData.tch_pic} alt="Profile" className="profile-pic w-36 h-36 rounded-full mx-auto mb-4" />
                <h2 className="text-2xl font-bold">{teacherData.tch_name}</h2>
                <p><span className='text-lg font-bold'>Teacher ID: </span>{teacherData.tch_id}</p>
                <p><span className='text-lg font-bold'>College Name: </span>{teacherData.ins_name}</p>
                <p><span className='text-lg font-bold'>Email: </span>{teacherData.tch_email}</p>
                <p><span className='text-lg font-bold'>Mobile No: </span>{teacherData.tch_mobile}</p>
            </section>

            <div className="flex flex-wrap justify-around w-full mt-6">
                <div className="w-52 h-40 mb-4 bg-white p-4 rounded-md text-center">
                    <h2 className="mb-2 text-lg font-bold">Attendance</h2>
                    <img src={attendance_img} alt="" className="h-3/5 mx-auto cursor-pointer" onClick={() => handleModalOpen("attendance")}/>
                </div>
                <div className="w-52 h-40 mb-4 bg-white p-4 rounded-md text-center">
                    <h2 className="mb-2 text-lg font-bold">Notes</h2>
                    <img src={notes_img} alt="" className="h-3/5 mx-auto cursor-pointer" onClick={() => handleModalOpen("notes")}/>
                </div>
                <div className="w-52 h-40 mb-4 bg-white p-4 rounded-md text-center">
                    <h2 className="mb-2 text-lg font-bold">Assignment</h2>
                    <img src={assignment_img} alt="" className="h-3/5 mx-auto cursor-pointer" onClick={() => handleModalOpen("assignment")}/>
                </div>
                <div className="w-52 h-40 mb-4 bg-white p-4 rounded-md text-center">
                    <h2 className="mb-2 text-lg font-bold">Chat</h2>
                    <img src={chat_img} alt="" className="h-3/5 mx-auto cursor-pointer" onClick={() => handleModalOpen("chat")}/>
                </div>
            </div>
        </div>}
        
        {modalVisible ? <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-md w-full max-w-sm">
                <h2 className="text-xl font-bold mb-4">Select Subject for</h2>
                <form>
                <label htmlFor="subDropdown" className="block mb-2">Subject:</label>
                <select name="subDropdown" onChange={(e)=>{setSubject(e.target.value)}} required className="w-full p-2 mb-4 border border-gray-300 rounded-md">
                    <option value="">Select Subject</option>
                    <option value="computer">computer</option>
                    <option value="computer1">computer1</option>
                    <option value="computer2">computer2</option>
                </select>
                <div className="flex justify-between">
                    <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-md" onClick={selectMenu}>Select</button>
                    <button type="button" className="bg-red-500 text-white px-4 py-2 rounded-md" onClick={handleModalClose}>Cancel</button>
                </div>
                </form>
            </div>
        </div>: null}
    </>
  );
};  

export default TeacherDashboard;