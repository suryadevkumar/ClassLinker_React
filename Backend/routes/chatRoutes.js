import express from 'express';
const router = express.Router();
import { getMessage, sendMessage } from '../controllers/chat.js';

router.get('message', getMessage);
router.post('/sendMessage', sendMessage);

export default router;