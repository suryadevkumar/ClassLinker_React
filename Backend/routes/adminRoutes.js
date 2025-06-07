import express from 'express';
import {
    getAdminDetails, getDepartments, getCourses, getClasses, addClass,
    getClassList, getClassDetails, getSubjectList,
    addSubject, updateSubject, deleteSubject,
    getStudentList, getTeacherList, getUnverifiedTeachers,
    getUnverifiedStudents, verifyTeacher, verifyStudent,
    getStudentDetails, getTeacherDetails,
    updateStudent, updateTeacher
} from '../controllers/admin.js';
import upload from '../utils/uploadMiddleware.js';

const router = express.Router();

router.get('/getAdminDetails', getAdminDetails);

// Class management
router.get('/departments', getDepartments);
router.get('/courses', getCourses);
router.get('/classes', getClasses);
router.post('/addClass', upload.none(), addClass);
router.post('/class/list', getClassList);
router.post('/class/details', getClassDetails);

// Subject management
router.post('/subject/list', getSubjectList);
router.post('/subject', upload.none(), addSubject);
router.post('/subject/update', upload.none(), updateSubject);
router.post('/subject/delete', deleteSubject);

// User management
router.post('/student/list', getStudentList);
router.get('/student/details', getStudentDetails);
router.put('/student/update', upload.fields([{ name: 'STD_PIC', maxCount: 1 }, { name: 'STD_DOC', maxCount: 1 }]), updateStudent);
router.get('/teacher/list', getTeacherList);
router.get('/teacher/details', getTeacherDetails);
router.put('/teacher/update', upload.single('TCH_PIC'), updateTeacher);
router.get('/teacher/unverified', getUnverifiedTeachers);
router.get('/student/unverified', getUnverifiedStudents);
router.post('/teacher/verify', verifyTeacher);
router.post('/student/verify', verifyStudent);

export default router;