import express from 'express';
import { subjectList, teacherDetailsFetch, teacherSignup } from '../controllers/teacher.js';
import upload from '../utils/uploadMiddleware.js';

const router = express.Router();

router.post('/signup', upload.single('photo'), teacherSignup);
router.get('/details',teacherDetailsFetch)
router.get('/subject/list',subjectList)

export default router;