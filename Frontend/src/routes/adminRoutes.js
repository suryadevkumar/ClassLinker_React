import axios from "axios";

export const getAdminDetails = async () => {
    try {
        const response = await axios.get('/admin/getAdminDetails', {
            withCredentials: true,
        });
        return response.data.data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to load admin data',
        };
    }
};

// Department routes
export const getDepartments = async (instituteId) => {
    try {
        const response = await axios.get('/admin/departments', {
            params: { instituteId },
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to load department',
        };
    }
};

// Course routes
export const getCourses = async (departmentId) => {
    try {
        const response = await axios.get('/admin/courses', {
            params: { departmentId },
        });
        return response.data;
    } catch (error) {
        console.error("Error loading courses:", error);
    }
};

// Class routes
export const getClasses = async (courseId) => {
    try {
        const response = await axios.get('/admin/classes', {
            params: { courseId },
        });
        return response.data;
    } catch (error) {
        console.error("Error loading classes:", error);
    }
};

// Class list with filter
export const getClassList = async (dep, crs, cls) => {
    try {
        const response = await axios.post('/admin/class/list',
            { dep, crs, cls },
            {
                withCredentials: true
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error loading class list:", error);
        throw error;
    }
};

// Class add
export const addClass = async (formData) => {
    try {
        const response = await axios.post('/admin/addClass', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error("Error adding class:", error);
        throw error;
    }
};

// subject details
export const getClassDetails = async (idcc_id) => {
    try {
        const response = await axios.post('/admin/class/details', { idcc_id });
        return response.data;
    } catch (error) {
        console.error('Error fetching class details:', error);
    }
};

// subject list
export const getSubjectList = async (idcc_id) => {
    try {
        const response = await axios.post('/admin/subject/list', { idcc_id });
        return response.data;
    } catch (error) {
        console.error('Error fetching subject list:', error);
    }
};

// teacher list
export const getTeacherList = async () => {
    try {
        const response = await axios.get('/admin/teacher/list', {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching subject list:', error);
    }
};

//add subject
export const addSubject = async (idcc_id, subjectName, teacherId) => {
    try {
        const response = await axios.post('/admin/subject', {
            idcc_id,
            subjectName,
            teacherId
        });

        return response.data;
    } catch (error) {
        console.error('Error adding subject:', error);
    }
};

//update subject
export const updateSubject = async (subject_id, subjectName, teacherId) => {
    try {
        const response = await axios.post("admin/subject/update", {
            subject_id,
            subjectName,
            teacherId,
        });

        return response.data;
    } catch (error) {
        console.error("Error updating subject:", error);
    }
};

//delete subject
export const deleteSubject = async (subject_id) => {
    try {
        const response = await axios.post('/admin/subject/delete', {
            subject_id
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting subject:', error);
    }
};

//student list
export const getStudentList = async (dep, crs, cls) => {
    try {
        const response = await axios.post('/admin/student/list',
            { dep, crs, cls },
            {
                withCredentials: true
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error loading class list:", error);
        throw error;
    }
};

// Get detailed student information
export const getStudentDetails = async (studentId) => {
    try {
        const response = await axios.get('/admin/student/details', {
            params: { studentId },
        });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching student details:", error);
        throw error;
    }
};

// Update student details
export const updateStudentDetails = async (formDataToSend) => {
    try {
        const response = await axios.put('/admin/student/update', formDataToSend, {
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

// Get detailed teacher information
export const getTeacherDetails = async (teacherId) => {
    try {
        const response = await axios.get('/admin/teacher/details', {
            params: { teacherId },
        });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching student details:", error);
        throw error;
    }
};

// Update teacher details
export const updateTeacherDetails = async (formDataToSend) => {
    try {
        const response = await axios.put('/admin/teacher/update', formDataToSend, {
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

// unverified user
export const getUnverifiedUser = async () => {
    try {
        const response = await axios.get('/admin/unverifiedUser',{
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching unverified student and teacher:", error);
        throw error;
    }
};

//verify user
export const verifyUser = async (userId, userType) => {
    try {
        const response = await axios.post('/admin/user/verify', {
            userId,
            userType
        });

        return response.data;
    } catch (error) {
        console.error(`Error in verify ${userType}:`, error);
    }
};

//delete user
export const deleteUser = async (userId, userType) => {
    try {
        const response = await axios.post('/admin/user/delete', {
            userId,
            userType
        });

        return response.data;
    } catch (error) {
        console.error(`Error in verify ${userType}:`, error);
    }
};
