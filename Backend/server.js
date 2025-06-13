import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import cors from 'cors';
import http from 'http';
import FileStore from 'session-file-store';

import db from './config/db.js';
import setupSocket from './utils/chatSocket.js';

import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import instituteRoutes from './routes/instituteRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import notesRoutes from './routes/notesRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import lectureRoutes from './routes/lectureRoutes.js';

const app = express();
const server = http.createServer(app);
const fileStore = FileStore(session);

// Increase payload limits for large file uploads
app.use(bodyParser.json({ limit: '50gb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50gb' }));
app.use(express.json({ limit: '50gb' }));

// Configure CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Session configuration
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: new fileStore({
    path: './sessions',
    ttl: 3 * 24 * 60 * 60,
  }),
  cookie: {
    maxAge: 3 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Set server timeout for large uploads
server.timeout = 30 * 60 * 1000; // 30 minutes
server.headersTimeout = 35 * 60 * 1000; // 35 minutes
server.keepAliveTimeout = 30 * 60 * 1000; // 30 minutes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large' });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Unexpected file field' });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize database
db.initialize().catch(err => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/institute', instituteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/assignment', assignmentRoutes);
app.use('/api/lecture', lectureRoutes);

setupSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('Server running at http://localhost:3000')
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await db.close();
  server.close();
});