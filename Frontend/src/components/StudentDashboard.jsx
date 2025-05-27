import { useEffect, useState } from 'react';
import attendance_img from "../assets/img/attendance.png";
import notes_img from "../assets/img/notes.png";
import assignment_img from "../assets/img/assignment.png";
import chat_img from "../assets/img/chat.png";
import { api, jpgImg } from "../config/config.js"
import UnverifiedCard from './UnverifiedCard';

const StudentDashboard = () => {
  const [verified, setVerified] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [studentData, setStudentData] = useState({});
  const [subject, setSubject] = useState("");
  
  useEffect(()=>{
    getStudentDetails();
  },[])

  const getStudentDetails=async()=>{
    const response = await fetch(api+'/studentDetailsFetch',{
        method: 'GET',
        credentials: 'include'
    })
    const data=await response.json();
    if(data.verified==1){
        setVerified(true);
        setStudentData(data);
    }
  }

  const handleModalOpen = (modalType) => {
    setModalVisible(true);
    setModalContent(modalType);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setModalContent(null);
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
                <img src={jpgImg + studentData.std_pic} alt="Profile" className="w-36 h-36 rounded-full mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">{studentData.std_name}</h2>
                <p className='mb-4'><strong>Scholar ID: </strong>{studentData.sch_id}</p>
                <p className='mb-4'><strong>College Name: </strong>{studentData.ins_name}</p>
                <p className='mb-4'><strong>Email: </strong>{studentData.std_email}</p>
                <p className='mb-4'><strong>Mobile No: </strong>{studentData.std_mobile}</p>
                <p className='mb-4'><strong>Department: </strong>{studentData.dep_name}</p>
                <p className='mb-4'><strong>Course: </strong>{studentData.crs_name}</p>
                <p className='mb-4'><strong>Class: </strong>{studentData.cls_name}</p>
                <p className='mb-4'><strong>Class: </strong>{studentData.section}</p>
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
                <h2 className="text-xl font-bold mb-4">Select Subject for {modalContent}</h2>
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
        </div>  :null}
    </>
  );
};

export default StudentDashboard;