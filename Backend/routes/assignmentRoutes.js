import express from 'express';
import { getAssignmentList, uploadAssignment, downloadAssignment, deleteAssignment,submitAssignment,
    getStudentSubmissions, downloadSubmittedAssignment ,getSubmittedAssignments,viewStudentAssignment } from '../controllers/assignment.js';
import upload from '../utils/uploadMiddleware.js';

const router = express.Router();

router.post('/list', getAssignmentList);
router.post('/upload', upload.single('assignmentFile'), uploadAssignment);
router.get('/download', downloadAssignment);
router.delete('/delete', deleteAssignment);
router.post('/submit', upload.single('pdfFile'), submitAssignment);
router.post('/getStudentSubmissions', getStudentSubmissions);
router.get('/downloadSubmittedAssignment', downloadSubmittedAssignment);
router.get('/getSubmittedAssignments', getSubmittedAssignments);
router.get('/viewStudentAssignment', viewStudentAssignment);

export default router;