import express from 'express';
import { teacherSignup } from '../controllers/teacher.js';
import upload from '../utils/uploadMiddleware.js';

const router = express.Router();

router.post('/signup', upload.single('photo'), teacherSignup);

export default router;