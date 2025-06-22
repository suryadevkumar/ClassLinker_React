import db from '../config/db.js';
import oracledb from 'oracledb';
import bcrypt from 'bcrypt';
import handleLob from '../utils/handleLob.js';

//teacher signup Routes
export const teacherSignup = async(req,res)=>{
    const{tchName, tchCode, tchMob, tchMail, college, pass}=req.body;
    const tchPic=req.file?.buffer;
    const hashPass= await bcrypt.hash(pass,10);
    
    try{
        db.execute(
            `INSERT INTO teacher (tch_id, tch_name, tch_code, tch_email, tch_mobile, tch_pass, ins_id, tch_pic)
            VALUES (tch_id_seq.NEXTVAL, :tchName, :tchCode, :tchMail, :tchMob, :hashPass, :college, :tchPic)`,
        {tchName,tchCode, tchMail, tchMob, hashPass, college, tchPic: { val: tchPic, type: oracledb.BLOB }},
        {autoCommit: true})
        res.send('Signup Successful')
    }
    catch(err)
    {
        console.error(err);
    }
};

//Routes for teacher dashboard data fetch
export const teacherDetailsFetch = async (req, res) => {
    ;
    try {
        const result = await db.execute(
            `SELECT tch_id, tch_name, tch_code, tch_email, tch_mobile, tch_pic, ins_id, verified FROM teacher WHERE tch_email = :email`,
            { email: req.session.teacherMail }
        );
        
        const [tch_id, tchName, tchId, tchEmail, tchMobile, tchPic, insId, verified] = result.rows[0];

        if(verified!=='Verified') return res.json({ verified: verified });

        req.session.teacher_id=tch_id;
        req.session.userID=tch_id;
        req.session.userName=tchName;
        const result1 = await db.execute(
            `SELECT ins_name FROM institute WHERE ins_id = :insId`,
            { insId: insId }
        );

        const insName = result1.rows[0];

        const base64AdPic = await handleLob(tchPic);

        res.json({
            tch_id: tch_id,
            tch_name: tchName,
            tch_code: tchId,
            tch_email: tchEmail,
            tch_mobile: tchMobile,
            tch_pic: base64AdPic,
            ins_name: insName,
            verified: verified
        });
    } catch (err) {
        console.error('Error fetching teacher details:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

//load subject list in select box
export const subjectList = async(req, res)=>{
    try{
        const result=await db.execute(`SELECT sub_id, dep_name, crs_name, cls_name, sub_name FROM subject_view WHERE tch_id=:tchId`,{tchId: req.session.teacher_id});
        res.json(result.rows);
    }
    catch(err){
        console.error(err);
    }
};