import express from 'express';
import {
    getAdminDetails, getDepartments, getCourses, getClasses, addClass,
    getClassList, getClassDetails, getSubjectList,
    addSubject, updateSubject, deleteSubject,
    getStudentList, getTeacherList,
    getStudentDetails, getTeacherDetails,
    updateStudent, updateTeacher,
    getUnverifiedUsers,
    verifyUser, deleteUser
} from '../controllers/admin.js';
import upload from '../utils/uploadMiddleware.js';
import { requiredUser } from '../utils/requiredUser.js';

const router = express.Router();

router.get('/getAdminDetails', requiredUser(["admin", "institute"]), getAdminDetails);

// Class management
router.get('/departments', getDepartments);
router.get('/courses', getCourses);
router.get('/classes', getClasses);
router.post('/addClass', requiredUser(["admin", "institute"]), upload.none(), addClass);
router.post('/class/list', requiredUser(["admin", "institute"]), getClassList);
router.post('/class/details', requiredUser(["admin", "institute"]), getClassDetails);

// Subject management
router.post('/subject/list', requiredUser(["admin", "institute"]), getSubjectList);
router.post('/subject', requiredUser(["admin", "institute"]), upload.none(), addSubject);
router.post('/subject/update', requiredUser(["admin", "institute"]), upload.none(), updateSubject);
router.post('/subject/delete', requiredUser(["admin", "institute"]), deleteSubject);

// User management
router.post('/student/list', requiredUser(["admin", "institute"]), getStudentList);
router.get('/student/details', requiredUser(["admin", "institute"]), getStudentDetails);
router.put('/student/update', requiredUser(["admin", "institute"]), upload.fields([{ name: 'STD_PIC', maxCount: 1 }, { name: 'STD_DOC', maxCount: 1 }]), updateStudent);
router.get('/teacher/list', requiredUser(["admin", "institute"]), getTeacherList);
router.get('/teacher/details', requiredUser(["admin", "institute"]), getTeacherDetails);
router.put('/teacher/update', requiredUser(["admin", "institute"]), upload.single('TCH_PIC'), updateTeacher);
router.get('/unverifiedUser', requiredUser(["admin", "institute"]), getUnverifiedUsers);
router.post('/user/verify', requiredUser(["admin", "institute"]), verifyUser);
router.post('/user/delete', requiredUser(["admin", "institute"]), deleteUser);

export default router;