import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

import db from './config/db.js';
import setupSocket from './utils/chatSocket.js';

import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import instituteRoutes from './routes/instituteRoutes.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

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
  cookie: { 
    maxAge: 3 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

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

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/institute', instituteRoutes);
app.use('/api/admin', adminRoutes);

// Initialize Socket.IO handlers
setupSocket(server);


// ......................

//student signup
//function to fetch institute list

// app.get('/getInstitute', async (req, res) => {
//     let connection;
//     try {
//         connection = await oracledb.getConnection(dbConfig);
//         const result = await connection.execute(
//             `SELECT DISTINCT ins_id AS id, ins_name AS name FROM institute`);
//         res.json(result.rows);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Error fetching departments');
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

// //function to fetch department
// app.get('/getDepList', async (req, res) => {
//     const { instId } = req.query;
//     let connection;
//     try {
//         connection = await oracledb.getConnection(dbConfig);
//         const result = await connection.execute(
//             `SELECT DISTINCT dep_id AS id, dep_name AS name FROM class_view WHERE ins_id = :ins_id`,
//             { ins_id: instId }
//         );
//         res.json(result.rows);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Error fetching courses');
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

// //function to fetch class
// app.get('/getSections', async (req, res) => {
//     const { clsId } = req.query;
//     let connection;
//     try {
//         connection = await oracledb.getConnection(dbConfig);
//         const result = await connection.execute(
//             `SELECT section FROM class_view WHERE cls_id = :cls_id`,
//             { cls_id: clsId }
//         );
//         res.send(`${result.rows[0][0]}`);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Error fetching classes');
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

// //check student email in used or not
// app.post('/checkStdEmailUsed',async(req,res)=>{
//     const{stdMail}=req.body;
//     let connection;
//     try{
//         connection=await oracledb.getConnection(dbConfig);
//         const result=await connection.execute(`SELECT COUNT(std_id) FROM student WHERE std_email=:email`,{email:stdMail});
//         const count = result.rows[0][0];
//         if(count>0)
//             res.send('yes');
//         else
//             res.send('good');
//     }
//     catch(err){
//         console.log(err);
//     }
//     finally{
//         if(connection)
//         {
//             try{
//                 connection.close();
//             }
//             catch(err)
//             {
//                 console.error(err);
//             }
//         }
            
//     }
// })

// //send otp to stdent email
// app.post('/sendStdEmail', (req, res) => {
//     let { email } = req.body;
//     otp1=generateOTP();
//     const mailOptions = {
//         from: 'suryadevkumar786786@gmail.com',
//         to: email,
//         subject: 'ClassLinker Email Verification',
//         text: `Welcome to ClassLinker!
//         your OTP is ${otp1}`
//     };

//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             console.error('Error:', error);
//             return res.send('Error sending email. Try again later.');
//         } else {
//             console.log('Email sent:', info.response);
//             return res.send('OTP Sent Successfully!');
//         }
//     });
// });

// //verify student otp
// app.post('/verifyOTP3',(req,res)=>{
//     const {stdOTP}=req.body;
//     if(stdOTP==otp1)
//         res.send('true');
//     else
//     res.send('false');
// })

// //student signup function
// app.post('/studentSignup', upload.fields([{ name: 'photo' }, { name: 'receipt' }]), async (req, res) => {
//     const { stdName, stdDob, scholarId, stdMob, stdMail, college, department, course, cls, section, pass } = req.body;
    
//     const stdPic = req.files?.photo?.[0]?.buffer;
//     const receipt = req.files?.receipt?.[0]?.buffer;
//     const hashPass = await bcrypt.hash(pass, 10);
//     const verified=0;
//     let connection;

//     try {
//         connection = await oracledb.getConnection(dbConfig);

//         const result = await connection.execute(`
//             SELECT idcc_id FROM idcc WHERE ins_id=:college AND dep_id=:department AND crs_id=:course AND cls_id=:cls`,
//             { college, department, course, cls });

//         const idccId = result.rows[0][0];

//         await connection.execute(
//             `INSERT INTO student (std_id, std_name, std_dob, sch_id, std_mobile, std_email, std_pass, section, idcc_id, verified, std_pic, std_doc)VALUES 
//             (std_id_seq.NEXTVAL, :stdName, TO_DATE(:stdDob, 'YYYY-MM-DD'), :scholarId, :stdMob, :stdMail, :hashPass, :section, :idccId, :verified, :stdPic, :stdDoc)`,
//             {
//                 stdName, stdDob, scholarId, stdMob, stdMail, hashPass, section, idccId, verified,
//                 stdPic: { val: stdPic, type: oracledb.BLOB },
//                 stdDoc: { val: receipt, type: oracledb.BLOB }
//             },
//             { autoCommit: true });

//         res.send('Signup Successful');
//     } catch (err) {
//         console.error(err);
//         res.status(500).send("Error during signup.");
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

// //function to student login
// app.post('/studentLogin',async (req,res)=>{
//     const {email, password}=req.body;
//     let connection;
//     try{
//         connection=await oracledb.getConnection(dbConfig);
//         const result=await connection.execute(`SELECT std_pass FROM student WHERE std_email=:stdMail`,{stdMail: email});
//         if(result.rows[0]){
//             if(await bcrypt.compare(password,result.rows[0][0])){
//                 req.session.studentMail = email;
//                 res.send('true');
//             }
//             else
//             res.send('false');
//         }   
//         else 
//             res.send('false');
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

// //function for student dashboard data fetch
// app.get('/studentDetailsFetch', async (req, res) => {
//     let connection;
//     try {
//         connection = await oracledb.getConnection(dbConfig);
//         const result = await connection.execute(
//             `SELECT std_id, std_name, sch_id, std_email, std_mobile, std_pic, idcc_id, verified FROM student WHERE std_email = :email`,
//             { email: req.session.studentMail }
//         );
        
//         const [stdId, stdName, schid, stdEmail, stdMobile, stdPic, idcc, verified] = result.rows[0];
//         req.session.idcc_id1 = idcc;
//         req.session.std_id = stdId;
//         req.session.userID1 = stdId;
//         req.session.userName1 = stdName;
//         const result1 = await connection.execute(
//             `SELECT ins_name, dep_name, crs_name, cls_name, section FROM class_view WHERE idcc_id = :idcc`,
//             { idcc: idcc }
//         );

//         const [insName, depName, crsName, clsName, sec] = result1.rows[0];

//         const handleLob = (stdPic) => {
//             return new Promise((resolve, reject) => {
//                 let chunks = [];
//                 stdPic.on('data', (chunk) => {
//                     chunks.push(chunk);
//                 });

//                 stdPic.on('end', () => {
//                     const buffer = Buffer.concat(chunks);
//                     const base64AdPic = buffer.toString('base64');
//                     resolve(base64AdPic);
//                 });

//                 stdPic.on('error', (err) => {
//                     console.error('LOB streaming error:', err);
//                     reject(err);
//                 });
//             });
//         };

//         const base64AdPic = await handleLob(stdPic);

//         res.json({
//             std_id: stdId,
//             std_name: stdName,
//             sch_id: schid,
//             std_email: stdEmail,
//             std_mobile: stdMobile,
//             std_pic: base64AdPic,
//             ins_name: insName,
//             dep_name: depName,
//             crs_name: crsName,
//             cls_name: clsName,
//             section: sec,
//             verified: verified
//         });
//     } catch (err) {
//         console.error('Error fetching student details:', err);
//         res.status(500).json({ message: 'Internal server error' });
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (closeErr) {
//                 console.error('Error closing connection:', closeErr);
//             }
//         }
//     }
// });

// //teacher function
// //check teacher email in used or not
// app.post('/checkTchEmailUsed',async(req,res)=>{
//     const{tchMail}=req.body;
//     let connection;
//     try{
//         connection=await oracledb.getConnection(dbConfig);
//         const result=await connection.execute(`SELECT COUNT(tch_id) FROM teacher WHERE tch_email=:email`,{email:tchMail});
//         const count = result.rows[0][0];
//         if(count>0)
//             res.send('yes');
//         else
//             res.send('good');
//     }
//     catch(err){
//         console.log(err);
//     }
//     finally{
//         if(connection)
//         {
//             try{
//                 connection.close();
//             }
//             catch(err)
//             {
//                 console.error(err);
//             }
//         }
            
//     }
// });

// //send otp to teacher email
// app.post('/sendTchEmail', (req, res) => {
//     let { email } = req.body;
//     otp2=generateOTP();
//     const mailOptions = {
//         from: 'suryadevkumar786786@gmail.com',
//         to: email,
//         subject: 'ClassLinker Email Verification',
//         text: `Welcome to ClassLinker!
//         your OTP is ${otp2}`
//     };

//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             console.error('Error:', error);
//             return res.send('Error sending email. Try again later.');
//         } else {
//             console.log('Email sent:', info.response);
//             return res.send('OTP Sent Successfully!');
//         }
//     });
// });

// //verify teacher otp
// app.post('/verifyOTP4',(req,res)=>{
//     const {tchOTP}=req.body;
//     if(tchOTP==otp2)
//         res.send('true');
//     else
//     res.send('false');
// })

// //teacher signup function
// app.post('/teacherSignup',upload.single('photo'), async(req,res)=>{
//     const{tchName, tchCode, tchMob, tchMail, college, pass}=req.body;
//     const tchPic=req.file?.buffer;
//     const hashPass= await bcrypt.hash(pass,10);
//     const verified=0;
//     let connection;
//     try{
//         connection=await oracledb.getConnection(dbConfig);
//         connection.execute(
//             `INSERT INTO teacher (tch_id, tch_name, tch_code, tch_email, tch_mobile, tch_pass, ins_id, verified, tch_pic)
//             VALUES (tch_id_seq.NEXTVAL, :tchName, :tchCode, :tchMail, :tchMob, :hashPass, :college, :verified, :tchPic)`,
//         {tchName,tchCode, tchMail, tchMob, hashPass, college, verified, tchPic: { val: tchPic, type: oracledb.BLOB }},
//         {autoCommit: true})
//         res.send('Signup Successful')
//     }
//     catch(err)
//     {
//         console.error(err);
//     }
//     finally{
//         if(connection)
//         {
//             try{
//                 connection.close();
//             }
//             catch(err)
//             {
//                 console.error(err);
//             }
//         }
//     }
// })

// //function to teacher login
// app.post('/teacherLogin',async (req,res)=>{
//     const {email, password}=req.body;
//     req.session.teacherMail=email;
//     let connection;
//     try{
//         connection=await oracledb.getConnection(dbConfig);
//         const result=await connection.execute(`SELECT tch_pass FROM teacher WHERE tch_email=:tchMail`,{tchMail: email});
//         if(result.rows[0])
//         {
//             if(await bcrypt.compare(password,result.rows[0][0]))
//             res.send('true');
//             else
//             res.send('false');
//         }   
//         else 
//             res.send('false');
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

// //function for teacher dashboard data fetch
// app.get('/teacherDetailsFetch', async (req, res) => {
//     let connection;
//     try {
//         connection = await oracledb.getConnection(dbConfig);
//         const result = await connection.execute(
//             `SELECT tch_id, tch_name, tch_code, tch_email, tch_mobile, tch_pic, ins_id, verified FROM teacher WHERE tch_email = :email`,
//             { email: req.session.teacherMail }
//         );
        
//         const [tch_id, tchName, tchId, tchEmail, tchMobile, tchPic, insId, verified] = result.rows[0];
//         req.session.teacher_id=tch_id;
//         req.session.userID=tch_id;
//         req.session.userName=tchName;
//         const result1 = await connection.execute(
//             `SELECT ins_name FROM institute WHERE ins_id = :insId`,
//             { insId: insId }
//         );

//         const insName = result1.rows[0];

//         const handleLob = (tchPic) => {
//             return new Promise((resolve, reject) => {
//                 let chunks = [];
//                 tchPic.on('data', (chunk) => {
//                     chunks.push(chunk);
//                 });

//                 tchPic.on('end', () => {
//                     const buffer = Buffer.concat(chunks);
//                     const base64AdPic = buffer.toString('base64');
//                     resolve(base64AdPic);
//                 });

//                 tchPic.on('error', (err) => {
//                     console.error('LOB streaming error:', err);
//                     reject(err);
//                 });
//             });
//         };

//         const base64AdPic = await handleLob(tchPic);

//         res.json({
//             user_id: tch_id,
//             tch_name: tchName,
//             tch_id: tchId,
//             tch_email: tchEmail,
//             tch_mobile: tchMobile,
//             tch_pic: base64AdPic,
//             ins_name: insName,
//             verified: verified
//         });
//     } catch (err) {
//         console.error('Error fetching teacher details:', err);
//         res.status(500).json({ message: 'Internal server error' });
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (closeErr) {
//                 console.error('Error closing connection:', closeErr);
//             }
//         }
//     }
// });

// //load subject list in select box
// app.get('/subList',async(req, res)=>{
//     let connection;
//     try{
//         connection=await oracledb.getConnection(dbConfig);
//         const result=await connection.execute(`SELECT sub_id, dep_name, crs_name, cls_name, sub_name FROM subject_view WHERE tch_id=:tchId`,{tchId: req.session.teacher_id});
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

// //function to find subject details
// app.post('/getSubDetails',async(req,res)=>{
//     const {sub_id}=req.body;
//     let connection;
//     try{
//         connection=await oracledb.getConnection(dbConfig);
//         const result=await connection.execute(`SELECT dep_name, crs_name, cls_name, sub_name, idcc_id FROM subject_view WHERE sub_id=:subId`,{subId: sub_id});
//         req.session.idcc_id=result.rows[0][4];
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