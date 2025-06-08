import axios from 'axios';

export const instituteSignup = async (formData) => {
    try {
        const response = await axios.post('/institute/instituteSignup', formData, {
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log(response);
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Signup failed',
        };
    }
};

export const getInstituteDetails = async () => {
    try {
        const response = await axios.get('/institute/getInstituteDetails', {
            withCredentials: true,
        });
        return response.data.data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to load institute data',
        };
    }
};

export const updateAdminDetails = async (formDataToSend) => {
    try {
        const response = await axios.put('/institute/admin/update', formDataToSend, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
                withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error("Error updating student:", error);
        throw error;
    }
};
