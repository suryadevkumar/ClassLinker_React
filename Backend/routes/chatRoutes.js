import express from 'express';
const router = express.Router();
import { getChatHistory, getParticipants, saveChatMessage } from '../controllers/chat.js';

router.get('/:subjectId/history', getChatHistory);
router.get('/:subjectId/participants', getParticipants);
router.post('/saveMessage', saveChatMessage);

export default router;