import express from 'express';
import { subjectList, teacherDetailsFetch, teacherSignup } from '../controllers/teacher.js';
import upload from '../utils/uploadMiddleware.js';
import { requiredUser } from '../utils/requiredUser.js';

const router = express.Router();

router.post('/signup', upload.single('photo'), teacherSignup);
router.get('/details', requiredUser(["teacher"]), teacherDetailsFetch)
router.get('/subject/list', requiredUser(["teacher"]), subjectList)

export default router;