import express from 'express';
import { getInstitute, getSections, studentDetailsFetch, studentSignup, subjectList } from '../controllers/student.js';
import upload from '../utils/uploadMiddleware.js';
import { requiredUser } from '../utils/requiredUser.js';

const router = express.Router();

router.get('/institute', getInstitute)
router.get('/sections', getSections)
router.post('/signup', upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'receipt', maxCount: 1 }]),studentSignup);
router.get('/details', requiredUser(["student"]), studentDetailsFetch)
router.get('/subject/list', requiredUser(["student"]), subjectList)

export default router;