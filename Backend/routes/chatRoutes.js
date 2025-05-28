import express from 'express';
const router = express.Router();
import { getMessage, sendMessage } from '../controllers/chat.js';

router.get('/messages', getMessage);
router.post('/send', sendMessage);

export default router;