import express from 'express';
import { getNotesList, uploadNotes, downloadNote, deleteNote, } from '../controllers/notes.js';
import upload from '../utils/uploadMiddleware.js';

const router = express.Router();

router.post('/list', getNotesList);
router.post('/upload', upload.single('notesFile'), uploadNotes);
router.get('/download', downloadNote);
router.delete('/delete', deleteNote);

export default router;