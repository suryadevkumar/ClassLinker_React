import bcrypt from 'bcrypt';
import oracledb from 'oracledb';
import db from '../config/db.js';

export const instituteSignup = async (req, res) => {
    const { insName, insCode, insMob, insMail, insAddress, adName, adMob, adMail, pass } = req.body;
    const adminPic = req.file?.buffer;

    try {
        const hashPass = await bcrypt.hash(pass, 10);

        await db.execute(
            `INSERT INTO INSTITUTE 
                (ins_id, ins_name, ins_code, ins_address, ins_email, ins_mobile, ins_pass, ad_name, ad_mobile, ad_email, ad_pic)
             VALUES 
                (ins_id_seq.NEXTVAL, :insName, :insCode, :insAddress, :insMail, :insMob, :hashPass, :adName, :adMob, :adMail, :adminPic)`,
            {
                insName, insCode, insAddress, insMail, insMob,
                hashPass, adName, adMob, adMail,
                adminPic: { val: adminPic, type: oracledb.BLOB }
            },
            { autoCommit: true }
        );

        res.status(200).json({ success: true, message: 'Signup successful' });

    } catch (err) {
        console.error(err);

        if (err.errorNum === 1) { // Unique constraint violation
            if (err.message.includes('UK_INS_EMAIL')) {
                res.status(400).json({ success: false, message: 'Email already exists' });
            } else if (err.message.includes('UK_INS_CODE')) {
                res.status(400).json({ success: false, message: 'Institute code already exists' });
            } else if (err.message.includes('UK_INS_MOBILE')) {
                res.status(400).json({ success: false, message: 'Mobile number already exists' });
            } else {
                res.status(500).json({ success: false, message: 'Database error' });
            }
        } else {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
};

export const getInstituteDetails = async (req, res) => {
    try {
        const result = await db.execute(
            `SELECT ins_name, ins_code, ins_email, ins_mobile, ad_email, ins_id 
             FROM INSTITUTE 
             WHERE ins_email = :email`,
            { email: req.session.instituteMail }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Institute not found' 
            });
        }

        const instituteData = result.rows[0];
        
        // Set session data
        req.session.inst_id = instituteData[5];   // ins_id
        req.session.adminMail = instituteData[4];   // ad_email

        // Return formatted response
        res.json({
            success: true,
            data: {
                name: instituteData[0],    // ins_name
                code: instituteData[1],   // ins_code
                email: instituteData[2],   // ins_email
                mobile: instituteData[3], // ins_mobile
                adminEmail: instituteData[4], // ad_email
                instituteId: instituteData[5] // ins_id
            }
        });

    } catch (err) {
        console.error('Error fetching institute details:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch institute details' 
        });
    }
};

export const updateAdminCredentials = async (req, res) => {
    const { adName, adMob, adEmail } = req.body;
    const adminPic = req.file?.buffer;

    console.log(req.body, adminPic, req.session.instituteMail)
    
    // Input validation
    if (!adName && !adMob && !adEmail && !adminPic) {
        return res.status(400).json({
            success: false,
            message: 'No fields provided for update'
        });
    }

    try {
        // Build parameterized query
        const updates = [];
        const binds = {};
        
        if (adName) {
            updates.push('AD_NAME = :adName');
            binds.adName = adName;
        }
        if (adMob) {
            updates.push('AD_MOBILE = :adMob');
            binds.adMob = adMob;
        }
        if (adEmail) {
            updates.push('AD_EMAIL = :adEmail');
            binds.adEmail = adEmail;
        }
        if (adminPic) {
            updates.push('AD_PIC = :adPic');
            binds.adPic = { val: adminPic, type: oracledb.BLOB };
        }

        // Parameterized query to prevent SQL injection
        const updateQuery = `
            UPDATE INSTITUTE 
            SET ${updates.join(', ')} 
            WHERE INS_EMAIL = :instituteEmail
        `;
        binds.instituteEmail = req.session.instituteMail;

        // Execute update
        const result = await db.execute(updateQuery, binds, { autoCommit: true });

        if (result.rowsAffected === 0) {
            return res.status(404).json({
                success: false,
                message: 'Institute not found'
            });
        }

        // Update session if email changed
        if (adEmail) {
            req.session.instituteMail = adEmail;
        }

        res.json({
            success: true,
            message: 'Admin credentials updated successfully',
            updatedFields: Object.keys(binds).filter(k => k !== 'instituteEmail')
        });

    } catch (err) {
        console.error('Error updating admin credentials:', err);

        res.status(500).json({
            success: false,
            message: 'Failed to update admin credentials'
        });
    }
};