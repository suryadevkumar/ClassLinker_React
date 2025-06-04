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
        console.log([...formData.entries()]);
        const response = await axios.post('/student/signup', formData, {
            withCredentials: true,
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.log(response)
        return response.data;
    } catch (error) {
        console.error("Signup error:", error);
        console.log("Server says:", error.response?.data); // Add this!
    }
}
