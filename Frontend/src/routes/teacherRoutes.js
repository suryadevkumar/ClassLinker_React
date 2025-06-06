import axios from 'axios';

export const submitTeacherSignup = async (formData) => {
    try {
        console.log(...formData);
        const response = await axios.post('/teacher/signup', formData, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error('Signup submission failed:', error);
        throw error;
    }
};

export const fetchTeacherDetails = async () => {
  try {
    const response = await axios.get(`teacher/teacherDetailsFetch`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching teacher details:', error);
    throw error;
  }
};

export const fetchSubjectList = async () => {
  try {
    const response = await axios.get(`teacher/subList`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching subject list:', error);
    throw error;
  }
};