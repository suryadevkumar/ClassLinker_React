import axios from 'axios';

export const getInstitute = async () => {
    try {
        const response = await axios.get('/student/institute');
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to load institute',
        };
    }
};

export const getSections = async (clsId) => {
    try {
        const response = await axios.get('/student/sections', {
            params: { clsId },
        });
        return response.data;
    } catch (error) {
        console.error("Error loading courses:", error);
    }
};

export const studentSignup = async (formData) => {
    try {
        const response = await axios.post('/student/signup', formData, {
            withCredentials: true,
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.error("Signup error:", error);
        console.log("Server says:", error.response?.data); // Add this!
    }
}

export const fetchStudentDetails = async () => {
  try {
    const response = await axios.get(`/student/details`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching student details:', error);
    throw error;
  }
};

export const fetchSubjectList = async () => {
  try {
    const response = await axios.get('/student/subject/list', {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching subject list:', error);
    throw error;
  }
};
