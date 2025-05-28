import express from 'express';
import { getInstitute, getSections } from '../controllers/student.js';

const router = express.Router();

router.get('/institute',getInstitute)
router.get('/sections', getSections)

export default router;