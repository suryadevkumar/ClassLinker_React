import { useState, useEffect } from 'react';
import { api } from '../config/config.js';

const StudentSignup = () => {
  const [step, setStep] = useState(1);
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [formData, setFormData] = useState({
    stdName: '',
    stdDob: '',
    scholarId: '',
    stdMob: '',
    stdMail: '',
    college: '',
    department: '',
    course: '',
    cls: '',
    section: '',
    pass: '',
    CNFpass: '',
    stdOTP: '',
  });

  useEffect(() => {
    fetch(api+'/getInstitute')
      .then((response) => response.json())
      .then((data) => {
        setColleges(data);
      })
      .catch((error) => console.error('Error loading colleges:', error));
  }, []);

  const handleNextStep = () => setStep(step + 1);
  const handlePrevStep = () => setStep(step - 1);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const clearOptions = (setter) => {
    setter([]);
  };

  const handleCollegeChange = (e) => {
    const instId = e.target.value;
    setFormData({ ...formData, college: instId });

    clearOptions(setDepartments);
    clearOptions(setCourses);
    clearOptions(setClasses);
    clearOptions(setSections);

    if (instId) {
      fetch(api+`/getDepList?instId=${instId}`)
        .then((response) => response.json())
        .then((data) => setDepartments(data))
        .catch((error) => console.error('Error loading departments:', error));
    }
  };

  const handleDepartmentChange = (e) => {
    const departmentId = e.target.value;
    setFormData({ ...formData, department: departmentId });

    clearOptions(setCourses);
    clearOptions(setClasses);
    clearOptions(setSections);

    if (departmentId) {
      fetch(api+`/getCourses?departmentId=${departmentId}`)
        .then((response) => response.json())
        .then((data) => setCourses(data))
        .catch((error) => console.error('Error loading courses:', error));
    }
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setFormData({ ...formData, course: courseId });

    clearOptions(setClasses);
    clearOptions(setSections);

    if (courseId) {
      fetch(api+`/getClasses?courseId=${courseId}`)
        .then((response) => response.json())
        .then((data) => setClasses(data))
        .catch((error) => console.error('Error loading classes:', error));
    }
  };

  const handleClassChange = (e) => {
    const clsId = e.target.value;
    console.log(clsId);
    setFormData({ ...formData, cls: clsId });

    clearOptions(setSections);

    if (clsId) {
      fetch(api+`/getSections?clsId=${clsId}`)
        .then((response) => response.json())
        .then((data) => {
            let sectionValue=[];
            for(let i=1;i<=data;i++)
            {
                sectionValue.push([i,"Section "+i])
            }
            setSections(sectionValue);
        })
        .catch((error) => console.error('Error loading sections:', error));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    // Submit form data to server
  };

  return (
    <div className="bg-gray-100 flex justify-center items-center min-h-[646px]">
      <div className="my-5 bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">Student Sign Up</h2>
        <form onSubmit={handleSubmit}>

          {step === 1?
            <div>
              <label className="font-semibold">Name:</label>
              <input
                type="text"
                name="stdName"
                placeholder='Enter Your Name'
                value={formData.stdName}
                onChange={handleChange}
                className="w-full p-2 mb-4 border rounded"
                required
              />

              <label className="font-semibold">Date of Birth:</label>
              <input
                type="date"
                name="stdDob"
                value={formData.stdDob}
                onChange={handleChange}
                className="w-full p-2 mb-4 border rounded"
                required
              />

              <label className="font-semibold">Scholar ID:</label>
              <input
                type="text"
                name="scholarId"
                value={formData.scholarId}
                onChange={handleChange}
                className="w-full p-2 mb-4 border rounded"
                required
              />

              <label className="font-semibold">Mobile Number:</label>
              <input
                type="text"
                name="stdMob"
                value={formData.stdMob}
                onChange={handleChange}
                className="w-full p-2 mb-4 border rounded"
                required
              />

              <label className="font-semibold">Email ID:</label>
              <input
                type="email"
                name="stdMail"
                value={formData.stdMail}
                onChange={handleChange}
                className="w-full p-2 mb-4 border rounded"
                required
              />

              <label className="font-semibold">College:</label>
              <select
                name="college"
                value={formData.college}
                onChange={handleCollegeChange}
                className="w-full p-2 mb-4 border rounded"
                required
              >
                <option value="">Select College</option>
                {colleges.map((college) => (
                  <option key={college[0]} value={college[0]}>{college[1]}</option>
                ))}
              </select>

              <label className="font-semibold">Department:</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleDepartmentChange}
                className="w-full p-2 mb-4 border rounded"
                required
              >
                <option value="">Select Department</option>
                {departments.map((department) => (
                  <option key={department[0]} value={department[0]}>{department[1]}</option>
                ))}
              </select>

              <label className="font-semibold">Course:</label>
              <select
                name="course"
                value={formData.course}
                onChange={handleCourseChange}
                className="w-full p-2 mb-4 border rounded"
                required
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course[0]} value={course[0]}>{course[1]}</option>
                ))}
              </select>

              <label className="font-semibold">Class:</label>
              <select
                name="classs"
                value={formData.classs}
                onChange={handleClassChange}
                className="w-full p-2 mb-4 border rounded"
                required
              >
                <option value="">Select Class</option>
                {classes.map((classs) => (
                  <option key={classs[0]} value={classs[0]}>{classs[1]}</option>
                ))}
              </select>

              <label className="font-semibold">Section:</label>
              <select
                name="section"
                value={formData.section}
                onChange={handleChange}
                className="w-full p-2 mb-4 border rounded"
                required
              >
                <option value="">Select Section</option>
                {sections.map((section) => (
                  <option key={section[0]} value={section[0]}>{section[1]}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full bg-gray-500 text-white p-2 rounded"
              >
                Next
              </button>
            </div>:
            <div>
              <label className="block mb-2">Create Password:</label>
              <input
                type="password"
                name="pass"
                value={formData.pass}
                onChange={handleChange}
                className="w-full p-2 mb-4 border rounded"
                required
              />

              <label className="block mb-2">Confirm Password:</label>
              <input
                type="password"
                name="CNFpass"
                value={formData.CNFpass}
                onChange={handleChange}
                className="w-full p-2 mb-4 border rounded"
                required
              />

              <button
                type="submit"
                className="w-full bg-green-500 text-white p-2 rounded"
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={handlePrevStep}
                className="w-full mt-2 bg-gray-500 text-white p-2 rounded"
              >
                Previous
              </button>
            </div>
          }
        </form>
      </div>
    </div>
  );
};

export default StudentSignup;
