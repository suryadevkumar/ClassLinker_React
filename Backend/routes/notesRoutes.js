import express from 'express';
import { getNotesList, uploadNotes, downloadNote, deleteNote, } from '../controllers/notes.js';
import upload from '../utils/uploadMiddleware.js';
import { requiredUser } from '../utils/requiredUser.js';

const router = express.Router();

router.post('/list', requiredUser(["teacher", "student"]), getNotesList);
router.post('/upload', requiredUser(["teacher"]), upload.single('notesFile'), uploadNotes);
router.get('/download', requiredUser(["teacher", "student"]), downloadNote);
router.delete('/delete', requiredUser(["teacher"]), deleteNote);

export default router;