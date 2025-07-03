import express from 'express';
import { instituteSignup, getInstituteDetails, updateAdminCredentials } from '../controllers/Institute.js';
import upload from '../utils/uploadMiddleware.js';
import { requiredUser } from '../utils/requiredUser.js';

const router = express.Router();

router.post('/instituteSignup', upload.single('photo'), instituteSignup);
router.get('/getInstituteDetails', requiredUser(["institute"]), getInstituteDetails);
router.put('/admin/update', requiredUser(["institute"]), upload.single('photo'), updateAdminCredentials);

export default router;