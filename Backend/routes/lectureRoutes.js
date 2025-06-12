import express from 'express';
import { 
  uploadLecture, 
  getLectures, 
  deleteLecture, 
  streamVideo 
} from '../controllers/lecture.js';
import upload from '../utils/uploadMiddleware.js';

const router = express.Router();

router.post('/upload', upload.single('videoFile'), uploadLecture);
router.get('/list', getLectures);
router.delete('/delete/:videoId', deleteLecture);
router.get('/stream', streamVideo);

export default router;