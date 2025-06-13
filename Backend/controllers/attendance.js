import db from '../config/db.js';
import handleLob from '../utils/handleLob.js';

//Routes to find subject details
export const getSubDetails = async(req,res)=>{
    const {sub_id}=req.body;
    ;
    try{
        const result=await db.execute(`SELECT dep_name, crs_name, cls_name, sub_name, idcc_id FROM subject_view WHERE sub_id=:subId`,{subId: sub_id});

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        
        req.session.idcc_id=result.rows[0][4];
        res.json(result.rows);
    }
    catch(err){
        console.error(err);
    }
};

//Routes to load student details for attendance
export const getStudentDetails = async(req,res)=>{  
    
    try{
        const result=await db.execute(`SELECT std_id, sch_id, std_name, std_pic FROM student WHERE verified='Verified' AND idcc_id=:idccId`,{idccId: req.session.idcc_id});
        const rows = result.rows;

        const studentsWithPics = await Promise.all(rows.map(async (row) => {
            const [stdId, schId, stdName, stdPic] = row;

            const base64Pic = await handleLob(stdPic);

            return {
                std_id: stdId,
                sch_id: schId,
                std_name: stdName,
                std_pic: base64Pic
            };
        }));

        res.json(studentsWithPics);
    }
    catch(err){
        console.error(err);
    }
};

//Routes to get attendance status
export const getAttendanceStats = async (req, res) => {
    const { std_id, sub_id } = req.body;
    ;

    try {        
        const totalClassesResult = await db.execute(
            `SELECT COUNT(*) AS total_classes 
            FROM attendance 
            WHERE sub_id = :sub_id AND std_id= :std_id`,
            { sub_id: sub_id, std_id: std_id }
        );
        
        const totalPresentResult = await db.execute(
            `SELECT COUNT(*) AS total_present 
            FROM attendance 
            WHERE sub_id = :sub_id 
            AND std_id = :std_id 
            AND attend_status = 'Present'`,
            {
                sub_id: sub_id,
                std_id: std_id
            }
        );

        res.json({
            totalClasses: totalClassesResult.rows[0][0],
            totalPresent: totalPresentResult.rows[0][0]
        });
    } catch (err) {
        console.error('Error fetching attendance stats:', err);
    }
};

//fucntion to mark attendance
export const markAttendance = async (req, res) => {
    const { std_id, sub_id, status } = req.body;
    ;

    try {
        await db.execute(
            `INSERT INTO attendance (attend_id, attend_date, attend_status, std_id, sub_id)
            VALUES (attend_id_seq.NEXTVAL, SYSDATE, :status, :std_id, :sub_id)`,
            {
                status: status,
                std_id: std_id,
                sub_id: sub_id
            },
            { autoCommit: true }
        );
    } catch (err) {
        console.error('Error executing query:', err);
    }
};

//update status of attendance
export const updateAttendance = async (req, res) => {
    const { std_id, sub_id, status } = req.body;
    ;
    try {        
        const result=await db.execute(
            `UPDATE attendance 
            SET attend_status = :status 
            WHERE std_id = :std_id 
            AND sub_id = :sub_id 
            AND TRUNC(attend_date) = TRUNC(SYSDATE)`,
            {
                status: status,
                std_id: std_id,
                sub_id: sub_id
            },
            { autoCommit: true }
        );
    } catch (err) {
        console.error('Error updating attendance:', err);
    }
};

// Check if attendance already marked today for a student
export const checkAttendanceMarked = async (req, res) => {
    const { std_id, sub_id } = req.body;
    
    try {
        const result = await db.execute(
            `SELECT attend_status 
             FROM attendance 
             WHERE std_id = :std_id 
             AND sub_id = :sub_id 
             AND TRUNC(attend_date) = TRUNC(SYSDATE)`,
            {
                std_id: std_id,
                sub_id: sub_id
            }
        );

        if (result.rows.length > 0) {
            res.json({
                exists: true,
                status: result.rows[0][0] // attend_status
            });
        } else {
            res.json({
                exists: false,
                status: null
            });
        }
    } catch (err) {
        console.error('Error checking attendance:', err);
        res.status(500).json({ error: 'Error checking attendance' });
    }
};

//Routes to load student attendance sheet and status for student view
export const getAttendanceDetails = async (req, res) => {
    const { sub_id } = req.body;

    try {
        const result=await db.execute(
            `SELECT TO_CHAR(ATTEND_DATE, 'DD/MM/YYYY') AS attend_date, attend_status 
            FROM attendance 
            WHERE sub_id = :sub_id AND std_id= :std_id`,
            { sub_id: sub_id, std_id: req.session.std_id }
        );

        const totalClassesResult = await db.execute(
            `SELECT COUNT(*) AS total_classes 
            FROM attendance 
            WHERE sub_id = :sub_id AND std_id= :std_id`,
            { sub_id: sub_id, std_id: req.session.std_id }
        );
        
        const totalPresentResult = await db.execute(
            `SELECT COUNT(*) AS total_present 
            FROM attendance 
            WHERE sub_id = :sub_id 
            AND std_id = :std_id 
            AND attend_status = 'Present'`,
            {
                sub_id: sub_id,
                std_id: req.session.std_id
            }
        );

        res.json({
            attendences: result.rows,
            totalClasses: totalClassesResult.rows[0][0],
            totalPresent: totalPresentResult.rows[0][0]
        });
    } catch (err) {
        console.error('Error fetching attendance stats:', err);
    }
};