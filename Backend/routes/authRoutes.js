import express from 'express';
const router = express.Router();
import { checkEmailUsed, sendOtp, verifyOtp, loginUser, checkSession, logout, updatePassword } from '../controllers/auth.js';

router.post('/checkEmailUsed', checkEmailUsed);
router.post('/sendOTP', sendOtp);
router.post('/verifyOTP', verifyOtp);
router.post('/login', loginUser);
router.post('/updatePassword', updatePassword);
router.get('/check/session', checkSession);
router.post('/logout', logout);

export default router;