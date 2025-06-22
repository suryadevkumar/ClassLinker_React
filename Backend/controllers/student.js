import db from "../config/db.js";
import bcrypt from "bcrypt";
import oracledb from 'oracledb';
import handleLob from "../utils/handleLob.js";

// function to fetch institute list
export const getInstitute = async (req, res) => {
    try {
        const result = await db.execute(
            'SELECT DISTINCT ins_id AS id, ins_name AS name FROM institute');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching departments');
    }
};

//function to fetch section
export const getSections = async (req, res) => {
    const { clsId } = req.query;
    try {
        const result = await db.execute(
            `SELECT section FROM class_view WHERE cls_id = :cls_id`,
            { cls_id: clsId }
        );
        res.send(`${result.rows[0]}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching classes');
    }
};

// student signup
export const studentSignup = async (req, res) => {
  try {
    const {
      stdName, stdDob, scholarId, stdMob, stdMail,
      college, department, course, cls, section, pass
    } = req.body;

    const stdPic = req.files?.photo?.[0]?.buffer;
    const receipt = req.files?.receipt?.[0]?.buffer;

    if (!pass || !stdPic || !receipt) {
      return res.status(400).json({
        success: false,
        message: 'All fields and files are required'
      });
    }

    const hashPass = await bcrypt.hash(pass, 10);

    const result = await db.execute(
      `SELECT idcc_id FROM idcc 
       WHERE ins_id = :college AND dep_id = :department 
       AND crs_id = :course AND cls_id = :cls`,
      { college, department, course, cls }
    );

    if (!result.rows.length) {
      return res.status(400).json({ success: false, message: 'Invalid academic combination' });
    }

    const idccId = result.rows[0][0];

    await db.execute(
      `INSERT INTO student (
        std_id, std_name, std_dob, sch_id, std_mobile, 
        std_email, std_pass, section, idcc_id, 
        std_pic, std_doc
      ) VALUES (
        std_id_seq.NEXTVAL, :stdName, TO_DATE(:stdDob, 'YYYY-MM-DD'), 
        :scholarId, :stdMob, :stdMail, :hashPass, :section, 
        :idccId, :stdPic, :stdDoc
      )`,
      {
        stdName, stdDob, scholarId, stdMob, stdMail, hashPass,
        section, idccId,
        stdPic: { val: stdPic, type: oracledb.BLOB },
        stdDoc: { val: receipt, type: oracledb.BLOB }
      },
      { autoCommit: true }
    );

    res.status(200).json({ success: true, message: 'Signup successful' });

  } catch (err) {
    console.error("Signup error:", err);
    if (err.message.includes("unique constraint")) {
      return res.status(400).json({
        success: false,
        message: "Email or scholar ID already exists"
      });
    }
    res.status(500).json({ success: false, message: "Error during signup" });
  }
};

//Routes for student dashboard data fetch
export const studentDetailsFetch = async (req, res) => {
    ;
    try {
        const result = await db.execute(
            `SELECT std_id, std_name, sch_id, std_email, std_mobile, std_pic, idcc_id, verified FROM student WHERE std_email = :email`,
            { email: req.session.studentMail }
        );
        
        const [stdId, stdName, schid, stdEmail, stdMobile, stdPic, idcc, verified] = result.rows[0];

        if(verified !== "Verified") return res.json({verified: verified});

        req.session.idcc_id = idcc;
        req.session.std_id = stdId;
        req.session.userID = stdId;
        req.session.userName = stdName;
        req.session.userTame = "student";
        const result1 = await db.execute(
            `SELECT ins_name, dep_name, crs_name, cls_name, section FROM class_view WHERE idcc_id = :idcc`,
            { idcc: idcc }
        );

        const [insName, depName, crsName, clsName, sec] = result1.rows[0];

        const base64AdPic = await handleLob(stdPic);

        res.json({
            std_id: stdId,
            std_name: stdName,
            sch_id: schid,
            std_email: stdEmail,
            std_mobile: stdMobile,
            std_pic: base64AdPic,
            ins_name: insName,
            dep_name: depName,
            crs_name: crsName,
            cls_name: clsName,
            section: sec,
            verified: verified
        });
    } catch (err) {
        console.error('Error fetching student details:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

//Routes to load subject list in student dashboard
export const subjectList = async(req, res)=>{
    try{
        const result=await db.execute(`SELECT sub_id, sub_name FROM subject WHERE idcc_id=:idccId`,{idccId: req.session.idcc_id});
        res.json(result.rows);
    }
    catch(err){
        console.error(err);
    }
};
