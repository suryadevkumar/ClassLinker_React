import db from '../config/db.js';
import oracledb from 'oracledb';
import handleLob from '../utils/handleLob.js';

export const getAdminDetails = async (req, res) => {
    try {
        const result = await db.execute(
            `SELECT ad_name, ins_name, ad_email, ad_mobile, ad_pic, ins_id, ins_email
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

        const [adName, insName, adEmail, adMobile, adPic, insId, insEmail] = result.rows[0];
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
                instituteId: insId,
                instituteEmail: insEmail
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
        
        const inst_id = req.query.instituteId || req.session.inst_id;
        const result = await db.execute(
            `SELECT DISTINCT dep_id AS id, dep_name AS name 
             FROM class_view 
             WHERE ins_id = :inst_id`,
            { inst_id }
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
            `SELECT DISTINCT std_id, sch_id, std_name, dep_name, crs_name, cls_name 
             FROM student_view 
             WHERE ins_id = :ins_id 
             AND dep_id = :dep 
             AND crs_id = :crs 
             AND cls_id = :cls 
             AND verified = 'Verified'
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

export const getStudentDetails = async (req, res) => {
    try {
        const { studentId } = req.query;

        const studentQuery = `
            SELECT
                std_id,
                sch_id, 
                std_name, 
                TO_CHAR(std_dob, 'YYYY-MM-DD'),
                std_mobile,
                std_email,
                verified,
                section,
                ins_id,
                ins_name,
                idcc_id,
                dep_id,
                dep_name,
                crs_id,
                crs_name,
                cls_id,
                cls_name,
                std_pic,
                std_doc
            FROM student_view 
            WHERE std_id = :studentId
        `;

        const studentResult = await db.execute(studentQuery, { studentId });

        if (!studentResult.rows || studentResult.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Student not found' 
            });
        }

        const [STD_ID, SCH_ID, STD_NAME, STD_DOB, STD_MOBILE, STD_EMAIL, VERIFIED, SECTION,
            INS_ID, INS_NAME, IDCC_ID, DEP_ID, DEP_NAME, CRS_ID, CRS_NAME, CLS_ID, CLS_NAME, STD_PIC, STD_DOC
        ] = studentResult.rows[0];

        let stdPicBase64 = null;
        let stdDocBase64 = null;

        if (STD_PIC) {
            stdPicBase64 = await handleLob(STD_PIC);
        }

        if (STD_DOC) {
            stdDocBase64 = await handleLob(STD_DOC);
        }

        const responseData = {
            STD_ID,
            SCH_ID,
            STD_NAME,
            STD_DOB,
            STD_MOBILE,
            STD_EMAIL,
            VERIFIED,
            SECTION,
            INS_ID,
            INS_NAME,
            IDCC_ID,
            DEP_ID,
            DEP_NAME,
            CRS_ID,
            CRS_NAME,
            CLS_ID,
            CLS_NAME,
            STD_PIC: stdPicBase64,
            STD_DOC: stdDocBase64
        };

        res.json({
            success: true,
            data: responseData
        });

    } catch (err) {
        console.error('Error fetching student details:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch student details' 
        });
    }
};

export const updateStudent = async (req, res) => {
  try {
    const {
      SCH_ID, STD_NAME, STD_DOB, STD_MOBILE, SECTION, VERIFIED, DEP_ID, CRS_ID, CLS_ID, stdId
    } = req.body;
    
    const inst_id = req.session.inst_id;

    
    const stdPic = req.files?.STD_PIC?.[0]?.buffer;
    const stdDoc = req.files?.STD_DOC?.[0]?.buffer;

    console.log(DEP_ID, CRS_ID, CLS_ID, inst_id)
    
    // Step 1: Get idcc_id
    const idccResult = await db.execute(
        `SELECT idcc_id FROM idcc 
        WHERE ins_id = :inst_id AND dep_id = :DEP_ID
        AND crs_id = :CRS_ID AND cls_id = :CLS_ID`,
        { inst_id, DEP_ID, CRS_ID, CLS_ID }
    );
    
    console.log(idccResult)
    if (!idccResult.rows.length) {
      return res.status(400).json({ success: false, message: 'Invalid academic combination' });
    }

    const idccId = idccResult.rows[0][0];

    // Step 2: Build dynamic update query
    let updateQuery = `UPDATE student SET 
      std_name = :STD_NAME,
      std_dob = TO_DATE(:STD_DOB, 'YYYY-MM-DD'),
      sch_id = :SCH_ID,
      std_mobile = :STD_MOBILE,
      section = :SECTION,
      verified = :VERIFIED,
      idcc_id = :idccId`;

    const bindParams = {
      STD_NAME, STD_DOB, SCH_ID, STD_MOBILE, SECTION, VERIFIED, idccId,
    };

    
    // Add pic if provided
    if (stdPic) {
        updateQuery += `, std_pic = :stdPic`;
        bindParams.stdPic = { val: stdPic, type: oracledb.BLOB };
    }

    
    // Add doc if provided
    if (stdDoc) {
        updateQuery += `, std_doc = :stdDoc`;
        bindParams.stdDoc = { val: stdDoc, type: oracledb.BLOB };
    }
    
    updateQuery += ` WHERE std_id = :stdId`;
    bindParams.stdId = stdId;

    await db.execute(updateQuery, bindParams, { autoCommit: true });

    res.status(200).json({ success: true, message: "Student updated successfully" });

  } catch (err) {
    console.error("Update student error:", err);
    res.status(500).json({ success: false, message: "Error updating student" });
  }
};

export const getTeacherList = async (req, res) => {
    try {
        const result = await db.execute(
            `SELECT DISTINCT tch_id, tch_code, tch_name 
             FROM teacher 
             WHERE ins_id = :ins_id
             AND verified = 'Verified'`,
            { ins_id: req.session.inst_id }
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching teacher list' });
    }
};

export const getTeacherDetails = async (req, res) => {
    try {
        const { teacherId } = req.query;

        const teacherQuery = `
            SELECT
                tch_id,
                tch_code, 
                tch_name,
                tch_mobile,
                tch_email,
                verified,
                tch_pic
            FROM teacher 
            WHERE tch_id = :teacherId
        `;

        const teacherResult = await db.execute(teacherQuery, { teacherId });

        if (!teacherResult.rows || teacherResult.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Teacher not found' 
            });
        }

        const [TCH_ID, TCH_CODE, TCH_NAME, TCH_MOBILE, TCH_EMAIL, VERIFIED, TCH_PIC
        ] = teacherResult.rows[0];

        let tchPicBase64 = null;

        if (TCH_PIC) {
            tchPicBase64 = await handleLob(TCH_PIC);
        }

        const responseData = {
            TCH_ID, TCH_CODE, TCH_NAME, TCH_MOBILE, TCH_EMAIL, VERIFIED,
            TCH_PIC: tchPicBase64,
        };

        res.json({
            success: true,
            data: responseData
        });

    } catch (err) {
        console.error('Error fetching teacher details:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch teacher details' 
        });
    }
};

export const updateTeacher = async (req, res) => {
  try {
    const {
      TCH_CODE, TCH_NAME, TCH_MOBILE, VERIFIED, tchId
    } = req.body;
    
    const tchPic = req.file?.buffer;

    // Step 2: Build dynamic update query
    let updateQuery = `UPDATE teacher SET 
      tch_name = :TCH_NAME,
      tch_code = :TCH_CODE,
      tch_mobile = :TCH_MOBILE,
      verified = :VERIFIED`;

    const bindParams = {
      TCH_NAME, TCH_CODE, TCH_MOBILE, VERIFIED,
    };

    
    // Add pic if provided
    if (tchPic) {
        updateQuery += `, tch_pic = :tchPic`;
        bindParams.tchPic = { val: tchPic, type: oracledb.BLOB };
    }
    
    updateQuery += ` WHERE tch_id = :tchId`;
    bindParams.tchId = tchId;

    await db.execute(updateQuery, bindParams, { autoCommit: true });

    res.status(200).json({ success: true, message: "Teacher updated successfully" });

  } catch (err) {
    console.error("Update teacher error:", err);
    res.status(500).json({ success: false, message: "Error updating teacher" });
  }
};

export const getUnverifiedUsers = async (req, res) => {
  try {
    const inst_id = req.session.inst_id;

    // Fetch unverified teachers
    const teacherResult = await db.execute(
      `SELECT tch_id, tch_name, tch_pic 
       FROM teacher 
       WHERE ins_id = :inst_id AND verified = 'Unverified'`,
      { inst_id }
    );

    const teachers = await Promise.all(
      teacherResult.rows.map(async ([id, name, pic]) => ({
        tch_id: id,
        tch_name: name,
        tch_pic: pic ? await handleLob(pic) : null,
        status: 'pending'
      }))
    );

    // Fetch unverified students
    const studentResult = await db.execute(
      `SELECT std_id, std_name, std_pic 
       FROM student_view 
       WHERE ins_id = :inst_id AND verified = 'Unverified'`,
      { inst_id }
    );

    const students = await Promise.all(
      studentResult.rows.map(async ([id, name, pic]) => ({
        std_id: id,
        std_name: name,
        std_pic: pic ? await handleLob(pic) : null,
        status: 'pending'
      }))
    );

    // Send combined response
    res.json({
      teachers,
      students
    });

  } catch (err) {
    console.error("Error fetching unverified users:", err);
    res.status(500).json({ error: 'Error fetching unverified users' });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const { userType, userId } = req.body;

    if (!userType || !userId) {
      return res.status(400).json({ error: "Missing userType or userId" });
    }

    let query = '';
    let bindParams = { id: userId };

    if (userType === 'Teacher') {
      query = `UPDATE teacher SET verified = 'Verified' WHERE tch_id = :id`;
    } else if (userType === 'Student') {
      query = `UPDATE student SET verified = 'Verified' WHERE std_id = :id`;
    } else {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    await db.execute(query, bindParams, { autoCommit: true });

    res.json({ success: true });
  } catch (err) {
    console.error("Error verifying user:", err);
    res.status(500).json({ error: 'Error verifying user' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userType, userId } = req.body;

    if (!userType || !userId) {
      return res.status(400).json({ error: "Missing userType or userId" });
    }

    let query = '';
    let bindParams = { id: userId };

    if (userType === 'Teacher') {
      query = `DELETE FROM teacher WHERE tch_id = :id`;
    } else if (userType === 'Student') {
      query = `DELETE FROM student WHERE std_id = :id`;
    } else {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    const result = await db.execute(query, bindParams, { autoCommit: true });

    // Check if any rows were affected
    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: 'Error deleting user' });
  }
};