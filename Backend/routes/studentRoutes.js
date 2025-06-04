import express from 'express';
import { getInstitute, getSections, studentSignup } from '../controllers/student.js';
import upload from '../utils/uploadMiddleware.js';

const router = express.Router();

router.get('/institute',getInstitute)
router.get('/sections', getSections)
router.post('/signup', upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'receipt', maxCount: 1 }]),studentSignup);

export default router;