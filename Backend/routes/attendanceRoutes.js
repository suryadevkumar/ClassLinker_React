import express from 'express';
import { getSubDetails, getStudentDetails, getAttendanceStats, markAttendance,updateAttendance,checkAttendanceMarked,getAttendanceDetails } from '../controllers/attendance.js';
const router = express.Router();

router.post('/subject/details', getSubDetails);
router.get('/student/details', getStudentDetails);
router.post('/getAttendanceStats', getAttendanceStats);
router.post('/markAttendance', markAttendance);
router.put('/updateAttendance', updateAttendance);
router.post('/checkAttendanceMarked', checkAttendanceMarked);
router.post('/getAttendanceDetails', getAttendanceDetails);

export default router;