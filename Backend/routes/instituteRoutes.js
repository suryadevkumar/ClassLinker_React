import express from 'express';
import { instituteSignup, getInstituteDetails, updateAdminCredentials } from '../controllers/Institute.js';
import upload from '../utils/uploadMiddleware.js';

const router = express.Router();

router.post('/instituteSignup', upload.single('photo'), instituteSignup);
router.get('/getInstituteDetails', getInstituteDetails);
router.put('/admin/update', upload.single('photo'), updateAdminCredentials);

export default router;