import axios from 'axios';

// Get subject details
export const getSubDetails = async (sub_id) => {
  try {
    const response = await axios.post('/attendance/subject/details', {sub_id} , {
            withCredentials: true,
        });
    return response.data;
  } catch (error) {
    console.error('Error fetching subject details:', error);
    throw error;
  }
};

// Get student details
export const getStudentDetails = async () => {
  try {
    const response = await axios.get(`/attendance/student/details`, {
            withCredentials: true,
        });
    console.log(response);
    return response.data;
  } catch (error) {
    console.error('Error fetching student details:', error);
    throw error;
  }
};

// Get attendance statistics
export const getAttendanceStats = async (std_id, sub_id) => {
  try {
    const response = await axios.post(`/attendance/getAttendanceStats`, { std_id, sub_id });
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    throw error;
  }
};

// Mark attendance
export const markAttendance = async (std_id, sub_id, status) => {
  try {
    const response = await axios.post(`/attendance/markAttendance`, { std_id, sub_id, status });
    return response.data;
  } catch (error) {
    console.error('Error marking attendance:', error);
    throw error;
  }
};

// Update attendance status
export const updateAttendance = async (std_id, sub_id, status) => {
  try {
    const response = await axios.put(`/attendance/updateAttendance`, { std_id, sub_id, status });
    return response.data;
  } catch (error) {
    console.error('Error updating attendance:', error);
    throw error;
  }
};

// Check if attendance already marked today
export const checkAttendanceMarked = async (std_id, sub_id) => {
  try {
    const response = await axios.post(`/attendance/checkAttendanceMarked`, { std_id, sub_id });
    return response.data;
  } catch (error) {
    console.error('Error checking attendance:', error);
    throw error;
  }
};

// Fetch attendance details
export const fetchAttendanceDetails = async (sub_id) => {
  try {
    const response = await axios.post('/attendance/getAttendanceDetails', { sub_id }, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance details:', error);
    throw error;
  }
};