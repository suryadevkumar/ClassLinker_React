import axios from 'axios';

export const uploadLecture = async (formData, config) => {
    try {
        const response = await axios.post('/lecture/upload', formData, {
            ...config,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading lecture:', error);
        throw error;
    }
};

export const getLectures = async (sub_id) => {
    try {
        const response = await axios.get('/lecture/list', { params: { sub_id } });
        return response.data;
    } catch (error) {
        console.error('Error fetching lectures:', error);
        throw error;
    }
};

export const deleteLecture = async (videoId) => {
    try {
        const response = await axios.delete(`/lecture/delete/${videoId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting lecture:', error);
        throw error;
    }
};