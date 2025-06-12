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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: new fileStore({
    path: './sessions', // Folder to save session files
    ttl: 3 * 24 * 60 * 60,
  }),
  cookie: {
    maxAge: 3 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Important for video streaming
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Disable compression for video streams
app.use((req, res, next) => {
  if (req.url.includes('/lecture/stream')) {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Encoding', 'identity');
  }
  next();
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize database
db.initialize().catch(err => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});

// routes
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


// ......................


// //function to load student details for attendance
// app.get('/getStudentDetails',async(req,res)=>{
//     let connection;
//     try{
//         connection=await oracledb.getConnection(dbConfig);
//         const result=await connection.execute(`SELECT std_id, sch_id, std_name, std_pic FROM student WHERE verified=1 AND idcc_id=:idccId`,{idccId: req.session.idcc_id});
//         const rows = result.rows;

//         const handleLob = (lob) => {
//             return new Promise((resolve, reject) => {
//                 let chunks = [];
//                 lob.on('data', (chunk) => {
//                     chunks.push(chunk);
//                 });

//                 lob.on('end', () => {
//                     const buffer = Buffer.concat(chunks);
//                     const base64Pic = buffer.toString('base64');
//                     resolve(base64Pic);
//                 });

//                 lob.on('error', (err) => {
//                     console.error('LOB streaming error:', err);
//                     reject(err);
//                 });
//             });
//         };

//         const studentsWithPics = await Promise.all(rows.map(async (row) => {
//             const [stdId, schId, stdName, stdPic] = row;

//             const base64Pic = await handleLob(stdPic);

//             return {
//                 std_id: stdId,
//                 sch_id: schId,
//                 std_name: stdName,
//                 std_pic: base64Pic
//             };
//         }));

//         res.json(studentsWithPics);
//     }
//     catch(err){
//         console.error(err);
//     }
//     finally{
//         if(connection)
//         {
//             try{
//                 connection.close();
//             }
//             catch(err){
//                 console.error(err);
//             }
//         }
//     }
// })

// //function to get attendance status
// app.post('/getAttendanceStats', async (req, res) => {
//     const { std_id, sub_id } = req.body;
//     let connection;

//     try {
//         connection = await oracledb.getConnection(dbConfig);

//         const totalClassesResult = await connection.execute(
//             `SELECT COUNT(*) AS total_classes 
//             FROM attendance 
//             WHERE sub_id = :sub_id AND std_id= :std_id`,
//             { sub_id: sub_id, std_id: std_id }
//         );

//         const totalPresentResult = await connection.execute(
//             `SELECT COUNT(*) AS total_present 
//             FROM attendance 
//             WHERE sub_id = :sub_id 
//             AND std_id = :std_id 
//             AND attend_status = 'Present'`,
//             {
//                 sub_id: sub_id,
//                 std_id: std_id
//             }
//         );

//         res.json({
//             totalClasses: totalClassesResult.rows[0][0],
//             totalPresent: totalPresentResult.rows[0][0]
//         });
//     } catch (err) {
//         console.error('Error fetching attendance stats:', err);
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (err) {
//                 console.error('Error closing connection:', err);
//             }
//         }
//     }
// });

// //fucntion to mark attendance
// app.post('/markAttendance', async (req, res) => {
//     const { std_id, sub_id, status } = req.body;
//     let connection;

//     try {
//         connection = await oracledb.getConnection(dbConfig);
//         await connection.execute(
//             `INSERT INTO attendance (attend_id, attend_date, attend_status, std_id, sub_id)
//             VALUES (attend_id_seq.NEXTVAL, SYSDATE, :status, :std_id, :sub_id)`,
//             {
//                 status: status,
//                 std_id: std_id,
//                 sub_id: sub_id
//             },
//             { autoCommit: true }
//         );
//     } catch (err) {
//         console.error('Error executing query:', err);
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (err) {
//                 console.error('Error closing connection:', err);
//             }
//         }
//     }
// });

// //update status of attendance
// app.post('/updateAttendance', async (req, res) => {
//     const { std_id, sub_id, status } = req.body;
//     let connection;
//     try {
//         connection = await oracledb.getConnection(dbConfig);

//         const result=await connection.execute(
//             `UPDATE attendance 
//             SET attend_status = :status 
//             WHERE std_id = :std_id 
//             AND sub_id = :sub_id 
//             AND TRUNC(attend_date) = TRUNC(SYSDATE)`,
//             {
//                 status: status,
//                 std_id: std_id,
//                 sub_id: sub_id
//             },
//             { autoCommit: true }
//         );
//     } catch (err) {
//         console.error('Error updating attendance:', err);
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (err) {
//                 console.error('Error closing connection:', err);
//             }
//         }
//     }
// });

// //notes
// //function to load notes
// app.post('/getNotesList', async (req, res) => {
//     const { sub_id } = req.body;
//     let connection;

//     try {
//         connection = await oracledb.getConnection(dbConfig);
//         const result = await connection.execute(
//             `SELECT notes_id, notes_name FROM notes WHERE sub_id = :subId`,
//             { subId: sub_id }
//         );
//         res.json(result.rows);
//     } catch (err) {
//         console.error('Error fetching notes:', err);
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (err) {
//                 console.error('Error closing connection:', err);
//             }
//         }
//     }
// });

// //function to upload notes
// app.post('/uploadNotes', upload.single('notesFile'), async (req, res) => {
//     const { notesTitle, sub_id } = req.body;
//     const notesFile = req.file?.buffer;
//     const fileType = req.file?.mimetype;

//     let connection;

//     try {
//         connection = await oracledb.getConnection(dbConfig);

//         const result = await connection.execute(
//             `INSERT INTO notes (notes_id, notes_name, notes_file, file_type, sub_id) 
//              VALUES (notes_id_seq.NEXTVAL, :notesTitle, :notesFile, :fileType, :sub_id)`, {
//             notesTitle: notesTitle,
//             notesFile: { val: notesFile, type: oracledb.BLOB },
//             fileType: fileType,
//             sub_id: sub_id
//         }, { autoCommit: true });

//         res.json({ success: true });
//     } catch (err) {
//         console.error('Error uploading note:', err);
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (err) {
//                 console.error(err);
//             }
//         }
//     }
// });

// //download notes
// app.get('/downloadNote/:noteId', async (req, res) => {
//     const { noteId } = req.params;
//     let connection;

//     try {
//         connection = await oracledb.getConnection(dbConfig);
//         const result = await connection.execute(
//             `SELECT notes_name, notes_file, file_type FROM notes WHERE notes_id = :noteId`,
//             { noteId: noteId }
//         );

//         const note = result.rows[0];
//         const fileName = note[0];
//         const fileData = note[1];
//         const fileType = note[2];

//         if (fileData) {
//             const buffer = await fileData.getData();
//             res.setHeader('Content-Type', fileType);
//             res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
//             res.send(buffer);
//         } else {
//             return res.status(500).send('File data is missing or corrupted');
//         }
//     } catch (err) {
//         console.error('Error downloading file:', err);
//         return res.status(500).send('Internal server error');
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (err) {
//                 console.error('Error closing database connection:', err);
//             }
//         }
//     }
// });

// //delete notes
// app.delete('/deleteNote/:noteId', async (req, res) => {
//     const { noteId } = req.params;
//     let connection;

//     try {
//         connection = await oracledb.getConnection(dbConfig);

//         const result = await connection.execute(
//             `DELETE FROM notes WHERE notes_id = :noteId`,
//             { noteId: noteId },
//             { autoCommit: true }
//         );
//         res.send('Note deleted successfully');
//     } catch (err) {
//         console.error('Error deleting note:', err);
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (err) {
//                 console.error(err);
//             }
//         }
//     }
// });

// //assignment
// //function to load assignment
// app.post('/getAssignmentList', async (req, res) => {
//     const { sub_id } = req.body;
//     let connection;

//     try {
//         connection = await oracledb.getConnection(dbConfig);
//         const result = await connection.execute(
//             `SELECT as_id, as_name FROM assignment WHERE sub_id = :subId`,
//             { subId: sub_id }
//         );
//         res.json(result.rows);
//     } catch (err) {
//         console.error('Error fetching assignment:', err);
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (err) {
//                 console.error('Error closing connection:', err);
//             }
//         }
//     }
// });

// //function to upload assignment
// app.post('/uploadAssignment', upload.single('assignmentFile'), async (req, res) => {
//     const { assignmentTitle, sub_id } = req.body;
//     const assignmentFile = req.file?.buffer;
//     const fileType = req.file?.mimetype;

//     let connection;

//     try {
//         connection = await oracledb.getConnection(dbConfig);

//         const result = await connection.execute(
//             `INSERT INTO assignment (as_id, as_name, as_file, file_type, sub_id) 
//              VALUES (assignment_id_seq.NEXTVAL, :assignmentTitle, :assignmentFile, :fileType, :sub_id)`, {
//             assignmentTitle: assignmentTitle,
//             assignmentFile: { val: assignmentFile, type: oracledb.BLOB },
//             fileType: fileType,
//             sub_id: sub_id
//         }, { autoCommit: true });

//         res.json({ success: true });
//     } catch (err) {
//         console.error('Error uploading assignment:', err);
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (err) {
//                 console.error(err);
//             }
//         }
//     }
// });

// //download assignment
// app.get('/downloadAssignment/:assignId', async (req, res) => {
//     const { assignId } = req.params;
//     let connection;

//     try {
//         connection = await oracledb.getConnection(dbConfig);

//         const result = await connection.execute(
//             `SELECT as_name, as_file, file_type FROM assignment WHERE as_id = :assignId`,
//             { assignId: assignId }
//         );

//         const assignment = result.rows[0];
//         const fileName = assignment[0];
//         const fileData = assignment[1];
//         const fileType = assignment[2];

//         if (fileData) {
//             const buffer = Buffer.isBuffer(fileData) ? fileData : await fileData.getData();
//             res.setHeader('Content-Type', fileType);
//             res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
//             res.send(buffer);
//         } else {
//             return res.status(500).send('File data is missing or corrupted');
//         }
//     } catch (err) {
//         console.error('Error downloading file:', err);
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (err) {
//                 console.error('Error closing database connection:', err);
//             }
//         }
//     }
// });

// //delete assignment
// app.delete('/deleteAssignment/:assignmentId', async (req, res) => {
//     const { assignmentId } = req.params;
//     let connection;

//     try {
//         connection = await oracledb.getConnection(dbConfig);

//         const result = await connection.execute(
//             `DELETE FROM assignment WHERE as_id = :assignmentId`,
//             { assignmentId: assignmentId },
//             { autoCommit: true }
//         );
//         res.send('Assignment deleted successfully');
//     } catch (err) {
//         console.error('Error deleting assignment:', err);
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (err) {
//                 console.error(err);
//             }
//         }
//     }
// });

// //function to load subject list in student dashboard
// app.get('/subList1',async(req, res)=>{
//     let connection;
//     try{
//         connection=await oracledb.getConnection(dbConfig);
//         const result=await connection.execute(`SELECT sub_id, sub_name FROM subject WHERE idcc_id=:idccId`,{idccId: req.session.idcc_id1});
//         res.json(result.rows);
//     }
//     catch(err){
//         console.error(err);
//     }
//     finally{
//         if(connection)
//         {
//             try{
//                 connection.close();
//             }
//             catch(err){
//                 console.error(err);
//             }
//         }
//     }
// })

// //function to load student attendance sheet and status for student view
// app.post('/getAttendanceDetails', async (req, res) => {
//     const { sub_id } = req.body;
//     let connection;

//     try {
//         connection = await oracledb.getConnection(dbConfig);
//         const result=await connection.execute(
//             `SELECT TO_CHAR(ATTEND_DATE, 'DD/MM/YYYY') AS attend_date, attend_status 
//             FROM attendance 
//             WHERE sub_id = :sub_id AND std_id= :std_id`,
//             { sub_id: sub_id, std_id: req.session.std_id }
//         );

//         const totalClassesResult = await connection.execute(
//             `SELECT COUNT(*) AS total_classes 
//             FROM attendance 
//             WHERE sub_id = :sub_id AND std_id= :std_id`,
//             { sub_id: sub_id, std_id: req.session.std_id }
//         );

//         const totalPresentResult = await connection.execute(
//             `SELECT COUNT(*) AS total_present 
//             FROM attendance 
//             WHERE sub_id = :sub_id 
//             AND std_id = :std_id 
//             AND attend_status = 'Present'`,
//             {
//                 sub_id: sub_id,
//                 std_id: req.session.std_id
//             }
//         );

//         res.json({
//             attendences: result.rows,
//             totalClasses: totalClassesResult.rows[0][0],
//             totalPresent: totalPresentResult.rows[0][0]
//         });
//     } catch (err) {
//         console.error('Error fetching attendance stats:', err);
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (err) {
//                 console.error('Error closing connection:', err);
//             }
//         }
//     }
// });

// //chat
// //function to load chats
// app.post('/getchats', async (req, res) => {
//     const {sub_id}=req.body;
//     let connection;
//     try {
//         connection = await oracledb.getConnection(dbConfig);
//         const result = await connection.execute(`
//             SELECT user_id, user_name, message,TO_CHAR(time, 'DD-MM-YYYY HH:MI AM') AS time FROM chat WHERE sub_id=:sub_id order by chat_id`,
//         {sub_id: sub_id});
//         res.json(result.rows);
//     } catch (err) {
//         console.error(err);
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (err) {
//                 console.error(err);
//             }
//         }
//     }
// });

// //function to send message
// app.post('/sendMessage', async (req, res) => {
//     const {sub_id, message} = req.body;
//     let connection;

//     try {
//         connection = await oracledb.getConnection(dbConfig);

//         const result=await connection.execute(
//             `INSERT INTO chat (chat_id, user_id, user_name, sub_id, message, time) VALUES 
//             (chat_id_seq.NEXTVAL,:userID, :userName, :sub_id, :message, SYSTIMESTAMP)`,
//             {userID: req.session.userID, userName: req.session.userName, sub_id, message},
//             { autoCommit: true });
//         res.send('true');
//     } catch (err) {
//         console.error(err);
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (err) {
//                 console.error("Error closing connection:", err);
//             }
//         }
//     }
// });

// //function to load chats student
// app.post('/getchats1', async (req, res) => {
//     const {sub_id}=req.body;
//     let connection;
//     try {
//         connection = await oracledb.getConnection(dbConfig);
//         const result = await connection.execute(`
//             SELECT user_id, user_name, message,TO_CHAR(time, 'DD-MM-YYYY HH:MI AM') AS time FROM chat WHERE sub_id=:sub_id order by chat_id`,
//         {sub_id: sub_id});
//         res.json(result.rows);
//     } catch (err) {
//         console.error(err);
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (err) {
//                 console.error(err);
//             }
//         }
//     }
// });

// //function to send message student
// app.post('/sendMessage1', async (req, res) => {
//     const {sub_id, message} = req.body;
//     let connection;

//     try {
//         connection = await oracledb.getConnection(dbConfig);

//         const result=await connection.execute(
//             `INSERT INTO chat (chat_id, user_id, user_name, sub_id, message, time) VALUES 
//             (chat_id_seq.NEXTVAL,:userID1, :userName1, :sub_id, :message, SYSTIMESTAMP)`,
//             {userID1: req.session.userID1, userName1: req.session.userName1, sub_id, message},
//             { autoCommit: true });
//         res.send('true');
//     } catch (err) {
//         console.error(err);
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (err) {
//                 console.error("Error closing connection:", err);
//             }
//         }
//     }
// });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('Server running at http://localhost:3000')
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await db.close();
  server.close();
});