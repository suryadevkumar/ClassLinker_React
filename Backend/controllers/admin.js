import db from '../config/db.js';
import oracledb from 'oracledb';

const handleLob = (lob) => {
    return new Promise((resolve, reject) => {
        let chunks = [];
        lob.on('data', (chunk) => {
            chunks.push(chunk);
        });

        lob.on('end', () => {
            const buffer = Buffer.concat(chunks);
            resolve(buffer.toString('base64'));
        });

        lob.on('error', (err) => {
            console.error('LOB streaming error:', err);
            reject(err);
        });
    });
};

export const getAdminDetails = async (req, res) => {
    try {
        const result = await db.execute(
            `SELECT ad_name, ins_name, ad_email, ad_mobile, ad_pic, ins_id 
             FROM INSTITUTE 
             WHERE ad_email = :email`,
            { email: req.session.adminMail }
        );

        if (!result.rows || result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Admin not found' 
            });
        }

        const [adName, insName, adEmail, adMobile, adPic, insId] = result.rows[0];
        req.session.inst_id = insId;

        let base64AdPic = null;
        if (adPic) {
            base64AdPic = await handleLob(adPic);
        }

        res.json({
            success: true,
            data: {
                adminName: adName,
                instituteName: insName,
                adminEmail: adEmail,
                adminMobile: adMobile,
                adminPic: base64AdPic,
                instituteId: insId
            }
        });

    } catch (err) {
        console.error('Error fetching admin details:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch admin details' 
        });
    }
};

export const getDepartments = async (req, res) => {
    try {
        const result = await db.execute(
            `SELECT DISTINCT dep_id AS id, dep_name AS name 
             FROM class_view 
             WHERE ins_id = :inst_id`,
            { inst_id: req.session.inst_id }
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching departments' });
    }
};

export const getCourses = async (req, res) => {
    try {
        const result = await db.execute(
            `SELECT DISTINCT crs_id AS id, crs_name AS name 
             FROM class_view 
             WHERE dep_id = :dep_id`,
            { dep_id: req.query.departmentId }
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching courses' });
    }
};

export const getClasses = async (req, res) => {
    try {
        console.log("class id hai ", req.query.courseId);
        const result = await db.execute(
            `SELECT cls_id AS id, cls_name AS name 
             FROM class_view 
             WHERE crs_id = :crs_id`,
            { crs_id: req.query.courseId }
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching classes' });
    }
};

export const addClass = async (req, res) => {
    const { department, newDep, course, newCrs, className, sectionNum } = req.body;
    console.log("Adding class:", { department, newDep, course, newCrs, className, sectionNum });
    
    let dep_id = 0;
    let crs_id = 0;
    let cls_id = 0;
    let connection;

    try {
        // Get a dedicated connection for the transaction
        connection = await oracledb.getConnection();
        
        // Start transaction explicitly
        await connection.execute('BEGIN NULL; END;'); // This ensures we're in a transaction

        console.log("Session inst_id:", req.session.inst_id);

        // 1. Insert class and get the generated ID
        const classResult = await connection.execute(`
            INSERT INTO class (cls_id, cls_name, section)
            VALUES (cls_id_seq.nextVal, :className, :sectionNum)
            RETURNING cls_id INTO :cls_id
        `, {
            className, 
            sectionNum,
            cls_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        }, { autoCommit: false });

        cls_id = classResult.outBinds.cls_id[0];
        console.log("Created class with ID:", cls_id);

        // 2. Handle department
        if (newDep !== "") {
            const depResult = await connection.execute(`
                INSERT INTO department (dep_id, dep_name)
                VALUES (dep_id_seq.nextVal, :newDep)
                RETURNING dep_id INTO :dep_id
            `, {
                newDep,
                dep_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
            }, { autoCommit: false });
            dep_id = depResult.outBinds.dep_id[0];
            console.log("Created department with ID:", dep_id);
        } else {
            dep_id = parseInt(department);
            console.log("Using existing department ID:", dep_id);
            
            // Verify department exists
            const depCheck = await connection.execute(
                'SELECT COUNT(*) as count FROM department WHERE dep_id = :dep_id',
                { dep_id }
            );
            if (depCheck.rows[0][0] === 0) {
                throw new Error(`Department with ID ${dep_id} does not exist`);
            }
        }

        // 3. Handle course
        if (newCrs !== "") {
            const crsResult = await connection.execute(`
                INSERT INTO course (crs_id, crs_name)
                VALUES (crs_id_seq.nextVal, :newCrs)
                RETURNING crs_id INTO :crs_id
            `, {
                newCrs,
                crs_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
            }, { autoCommit: false });
            crs_id = crsResult.outBinds.crs_id[0];
            console.log("Created course with ID:", crs_id);
        } else {
            crs_id = parseInt(course);
            console.log("Using existing course ID:", crs_id);
            
            // Verify course exists
            const crsCheck = await connection.execute(
                'SELECT COUNT(*) as count FROM course WHERE crs_id = :crs_id',
                { crs_id }
            );
            if (crsCheck.rows[0][0] === 0) {
                throw new Error(`Course with ID ${crs_id} does not exist`);
            }
        }

        // 4. Verify institute exists
        if (!req.session.inst_id) {
            throw new Error("Institute ID not found in session");
        }
        
        const instCheck = await connection.execute(
            'SELECT COUNT(*) as count FROM institute WHERE ins_id = :inst_id',
            { inst_id: req.session.inst_id }
        );
        if (instCheck.rows[0][0] === 0) {
            throw new Error(`Institute with ID ${req.session.inst_id} does not exist`);
        }

        console.log("Final values:", { 
            inst_id: req.session.inst_id, 
            dep_id, 
            crs_id, 
            cls_id 
        });

        // 5. Insert into idcc table
        await connection.execute(`
            INSERT INTO idcc (idcc_id, ins_id, dep_id, crs_id, cls_id)
            VALUES (idcc_id_seq.nextVal, :inst_id, :dep_id, :crs_id, :cls_id)
        `, { 
            inst_id: req.session.inst_id, 
            dep_id, 
            crs_id,
            cls_id 
        }, { autoCommit: false });

        // Commit the entire transaction
        await connection.commit();
        console.log("Transaction committed successfully");

        res.send("Class Added Successfully!");

    } catch (err) {
        console.error("Error in addClass:", err);
        
        // Rollback the transaction
        if (connection) {
            try {
                await connection.rollback();
                console.log("Transaction rolled back");
            } catch (rollbackErr) {
                console.error("Error during rollback:", rollbackErr);
            }
        }
        
        res.status(500).send(`Error adding class: ${err.message}`);
    } finally {
        // Always close the connection
        if (connection) {
            try {
                await connection.close();
            } catch (closeErr) {
                console.error("Error closing connection:", closeErr);
            }
        }
    }
};

export const getClassList = async (req, res) => {
    const { dep, crs, cls } = req.body;
    const binds = { ins_id: req.session.inst_id };
    let whereClause = 'ins_id = :ins_id';

    if (dep) {
        whereClause += ' AND dep_id = :dep';
        binds.dep = dep;
    }
    if (crs) {
        whereClause += ' AND crs_id = :crs';
        binds.crs = crs;
    }
    if (cls) {
        whereClause += ' AND cls_id = :cls';
        binds.cls = cls;
    }

    try {
        const result = await db.execute(
            `SELECT DISTINCT dep_name, crs_name, cls_name, idcc_id 
             FROM class_view 
             WHERE ${whereClause}`,
            binds
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching class list' });
    }
};

export const getClassDetails = async (req, res) => {
    try {
        const result = await db.execute(
            `SELECT DISTINCT dep_name, crs_name, cls_name 
             FROM class_view 
             WHERE idcc_id = :idcc_id`,
            { idcc_id: req.body.idcc_id }
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching class details' });
    }
};

export const getSubjectList = async (req, res) => {
    try {
        const result = await db.execute(
            `SELECT DISTINCT sub_id, sub_name, tch_name, tch_id 
             FROM subject_view 
             WHERE idcc_id = :idcc_id`,
            { idcc_id: req.body.idcc_id }
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error loading subjects' });
    }
};

export const addSubject = async (req, res) => {
    try {
        await db.execute(
            `INSERT INTO subject (sub_id, sub_name, idcc_id, tch_id)
             VALUES (sub_id_seq.nextVal, :subjectName, :idcc_id, :teacherId)`,
            req.body,
            { autoCommit: true }
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error adding subject' });
    }
};

export const updateSubject = async (req, res) => {
    try {
        await db.execute(
            `UPDATE subject 
             SET sub_name = :subjectName, tch_id = :teacherId 
             WHERE sub_id = :subject_id`,
            req.body,
            { autoCommit: true }
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error updating subject' });
    }
};

export const deleteSubject = async (req, res) => {
    try {
        await db.execute(
            `DELETE FROM subject 
             WHERE sub_id = :subject_id`,
            req.body,
            { autoCommit: true }
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error deleting subject' });
    }
};

export const getStudentList = async (req, res) => {
    try {
        const result = await db.execute(
            `SELECT DISTINCT sch_id, std_name, dep_name, crs_name, cls_name 
             FROM student_view 
             WHERE ins_id = :ins_id 
             AND dep_id = :dep 
             AND crs_id = :crs 
             AND cls_id = :cls 
             AND verified = 1
             ORDER BY sch_id ASC`,
            { 
                ins_id: req.session.inst_id,
                dep: req.body.dep,
                crs: req.body.crs,
                cls: req.body.cls
            }
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching student list' });
    }
};

export const getTeacherList = async (req, res) => {
    try {
        const result = await db.execute(
            `SELECT DISTINCT tch_id, tch_code, tch_name 
             FROM teacher 
             WHERE ins_id = :ins_id`,
            { ins_id: req.session.inst_id }
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching teacher list' });
    }
};

export const getUnverifiedTeachers = async (req, res) => {
    try {
        const result = await db.execute(
            `SELECT tch_id, tch_name, tch_pic 
             FROM teacher 
             WHERE ins_id = :inst_id AND verified = 0`,
            { inst_id: req.session.inst_id }
        );

        const teachers = await Promise.all(result.rows.map(async ([id, name, pic]) => ({
            tch_id: id,
            tch_name: name,
            tch_pic: pic ? await handleLob(pic) : null
        })));

        res.json(teachers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching unverified teachers' });
    }
};

export const getUnverifiedStudents = async (req, res) => {
    try {
        const result = await db.execute(
            `SELECT std_id, std_name, std_pic 
             FROM student_view 
             WHERE ins_id = :inst_id AND verified = 0`,
            { inst_id: req.session.inst_id }
        );

        const students = await Promise.all(result.rows.map(async ([id, name, pic]) => ({
            std_id: id,
            std_name: name,
            std_pic: pic ? await handleLob(pic) : null
        })));

        res.json(students);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching unverified students' });
    }
};

export const verifyTeacher = async (req, res) => {
    try {
        await db.execute(
            `UPDATE teacher 
             SET verified = :status 
             WHERE tch_id = :tch_id`,
            { 
                tch_id: req.body.tch_id,
                status: req.body.status === 'accept' ? 1 : 2
            },
            { autoCommit: true }
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error verifying teacher' });
    }
};

export const verifyStudent = async (req, res) => {
    try {
        await db.execute(
            `UPDATE student 
             SET verified = :status 
             WHERE std_id = :std_id`,
            { 
                std_id: req.body.std_id,
                status: req.body.status === 'accept' ? 1 : 2
            },
            { autoCommit: true }
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error verifying student' });
    }
};