import express from 'express';
import { getSubDetails, getStudentDetails, getAttendanceStats, markAttendance,updateAttendance,checkAttendanceMarked,getAttendanceDetails } from '../controllers/attendance.js';
import { requiredUser } from '../utils/requiredUser.js';
const router = express.Router();

router.post('/subject/details', requiredUser(["teacher"]), getSubDetails);
router.get('/student/details', requiredUser(["teacher"]), getStudentDetails);
router.post('/getAttendanceStats', requiredUser(["teacher"]), getAttendanceStats);
router.post('/markAttendance', requiredUser(["teacher"]), markAttendance);
router.put('/updateAttendance', requiredUser(["teacher"]), updateAttendance);
router.post('/checkAttendanceMarked', requiredUser(["teacher"]), checkAttendanceMarked);
router.post('/getAttendanceDetails', requiredUser(["teacher", "student"]), getAttendanceDetails);

export default router;