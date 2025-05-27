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
