import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory
  limits: {
    fileSize: 1024 * 1024 * 1024
  }
});

export default upload;