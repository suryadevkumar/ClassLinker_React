import express from 'express';
import { 
  uploadLecture, 
  getLectures, 
  deleteLecture, 
  streamVideo 
} from '../controllers/lecture.js';
import upload from '../utils/uploadMiddleware.js';
import { requiredUser } from '../utils/requiredUser.js';

const router = express.Router();

router.post('/upload', requiredUser(["teacher"]), upload.single('videoFile'), uploadLecture);
router.get('/list', requiredUser(["teacher", "student"]), getLectures);
router.delete('/delete/:videoId', requiredUser(["teacher"]), deleteLecture);
router.get('/stream', requiredUser(["teacher", "student"]), streamVideo);

export default router;