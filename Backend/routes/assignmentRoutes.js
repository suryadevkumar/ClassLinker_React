import express from 'express';
import { getAssignmentList, uploadAssignment, downloadAssignment, deleteAssignment,submitAssignment,
    getStudentSubmissions, downloadSubmittedAssignment ,getSubmittedAssignments,viewStudentAssignment } from '../controllers/assignment.js';
import upload from '../utils/uploadMiddleware.js';
import { requiredUser } from '../utils/requiredUser.js';

const router = express.Router();

router.post('/list', requiredUser(["teacher", "student"]), getAssignmentList);
router.post('/upload', requiredUser(["teacher"]), upload.single('assignmentFile'), uploadAssignment);
router.get('/download', requiredUser(["teacher", "student"]), downloadAssignment);
router.delete('/delete', requiredUser(["teacher"]), deleteAssignment);
router.post('/submit', requiredUser(["student"]), upload.single('pdfFile'), submitAssignment);
router.post('/getStudentSubmissions', requiredUser(["student"]), getStudentSubmissions);
router.get('/downloadSubmittedAssignment', requiredUser(["teacher", "student"]), downloadSubmittedAssignment);
router.get('/getSubmittedAssignments', requiredUser(["teacher"]), getSubmittedAssignments);
router.get('/viewStudentAssignment', requiredUser(["teacher"]), viewStudentAssignment);

export default router;