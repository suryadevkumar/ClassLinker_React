
import axios from 'axios';

// Get notes list
export const getNotesList = async (sub_id) => {
  try {
    const response = await axios.post('/notes/list', { sub_id });
    return response.data;
  } catch (error) {
    console.error('Error fetching notes list:', error);
    throw error;
  }
};

// Upload notes
export const uploadNotes = async (formData) => {
  try {
    const response = await axios.post('/notes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading notes:', error);
    throw error;
  }
};

// Download note
export const downloadNote = async (noteId) => {
  try {
    const response = await axios.get('/notes/download', {
      params: { noteId },
      responseType: 'blob'
    });

    // Get content type and filename from headers
    const contentType = response.headers['content-type'];
    const contentDisposition = response.headers['content-disposition'];
    const fileName = contentDisposition
      ? contentDisposition.split('filename=')[1].replace(/"/g, '')
      : `note_${noteId}`;

    return {
      data: response.data,
      fileName,
      contentType
    };
  } catch (error) {
    console.error('Error downloading note:', error);
    throw error;
  }
};


// Delete note
export const deleteNote = async (noteId) => {
  try {
    const response = await axios.delete('/notes/delete', {
      params: { noteId },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};