import axios from 'axios';

// Get assignment list
export const getAssignmentList = async (sub_id) => {
  try {
    const response = await axios.post('/assignment/list', { sub_id });
    return response.data;
  } catch (error) {
    console.error('Error fetching assignment list:', error);
    throw error;
  }
};

// Upload assignment
export const uploadAssignment = async (formData) => {
  try {
    const response = await axios.post('/assignment/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading assignment:', error);
    throw error;
  }
};

// Download assignment
export const downloadAssignment = async (assignId) => {
  try {
    const response = await axios.get('/assignment/download', {
      params: { assignId },
      responseType: 'blob'
    });

    // Get content type and filename from headers
    const contentType = response.headers['content-type'];
    const contentDisposition = response.headers['content-disposition'];
    const fileName = contentDisposition
      ? contentDisposition.split('filename=')[1].replace(/"/g, '')
      : `assignment_${assignId}`;

    return {
      data: response.data,
      fileName,
      contentType
    };
  } catch (error) {
    console.error('Error downloading assignment:', error);
    throw error;
  }
};

// Delete assignment
export const deleteAssignment = async (assignmentId) => {
  try {
    const response = await axios.delete('/assignment/delete', { params: { assignmentId } });
    return response.data;
  } catch (error) {
    console.error('Error deleting assignment:', error);
    throw error;
  }
};

// Submit assignment
export const submitAssignment = async (formData) => {
  try {
    const response = await axios.post('/assignment/submit', formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting assignment:', error);
    throw error;
  }
};

// In assignmentRoutes.js
export const downloadSubmittedAssignment = async (submitId) => {
  try {
    const response = await axios.get('/assignment/downloadSubmittedAssignment', {
      params: { submitId },
      responseType: 'blob'
    });

    const contentType = response.headers['content-type'];
    const contentDisposition = response.headers['content-disposition'];
    const fileName = contentDisposition
      ? contentDisposition.split('filename=')[1].replace(/"/g, '')
      : `submission_${submitId}`;

    return {
      data: response.data,
      fileName,
      contentType
    };
  } catch (error) {
    console.error('Error downloading submission:', error);
    throw error;
  }
};

export const getSubmittedAssignments = async (assignmentId) => {
  try {
    const response = await axios.get('/assignment/getSubmittedAssignments', { params: { assignmentId } });
    return response.data;
  } catch (error) {
    console.error('Error fetching submitted assignments:', error);
    throw error;
  }
};

export const viewStudentAssignment = async (submitId) => {
  try {
    const response = await axios.get('/assignment/viewStudentAssignment', {
      params: { submitId }, 
      responseType: 'blob'
    });

    const contentType = response.headers['content-type'];
    const contentDisposition = response.headers['content-disposition'];
    const fileName = contentDisposition
      ? contentDisposition.split('filename=')[1].replace(/"/g, '')
      : `submission_${submitId}`;

    return {
      data: response.data,
      fileName,
      contentType
    };
  } catch (error) {
    console.error('Error viewing assignment:', error);
    throw error;
  }
};

// Get student submissions
export const getStudentSubmissions = async (as_id) => {
  try {
    const response = await axios.post(`/assignment/getStudentSubmissions`, { as_id },{
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching submissions:', error);
    throw error;
  }
};