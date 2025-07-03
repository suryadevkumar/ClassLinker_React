import express from 'express';
const router = express.Router();
import { getMessage, sendMessage } from '../controllers/chat.js';
import { requiredUser } from '../utils/requiredUser.js';

router.get('/messages', requiredUser(["teacher", "student"]), getMessage);
router.post('/send', requiredUser(["teacher", "student"]), sendMessage);

export default router;