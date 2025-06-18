import bcrypt from 'bcrypt';
import db from '../config/db.js';
import sendEmail from '../utils/nodeMailer.js';

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export const checkEmailUsed = async (req, res) => {
    const { email } = req.body;
    try {
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const userEmailCheckMap = {
            institute: { table: 'institute', column: 'ins_email' },
            admin: { table: 'institute', column: 'ad_email' },
            teacher: { table: 'teacher', column: 'tch_email' },
            student: { table: 'student', column: 'std_email' }
        };

        for (const [userType, { table, column }] of Object.entries(userEmailCheckMap)) {
            const query = `SELECT 1 FROM ${table} WHERE ${column} = :email FETCH FIRST 1 ROWS ONLY`;
            const result = await db.execute(query, { email });
            if (result.rows.length > 0) {
                return res.json({ success: true, userType: userType });
            }
        }
        return res.json({ success: false });
    } catch (err) {
        console.error('Email check error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const sendOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    const otp = generateOTP();

    // Store OTP separately for each email
    req.session.otps = req.session.otps || {};
    req.session.otps[email] = {
        otp,
        generatedAt: Date.now(),
    };

    const text = `Welcome to ClassLinker!\nYour OTP is: ${otp}\nIt will be expired in 5 minutes`;
    const subject = 'ClassLinker Email Verification';

    try {
        const result = await sendEmail({ to: email, subject, text });

        if (result.success) {
            return res.status(200).json({
                success: true,
                message: 'OTP sent successfully',
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP',
            });
        }
    } catch (err) {
        console.error('Unexpected Error:', err);
        return res.status(500).json({ message: 'Unexpected server error' });
    }
};

export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'OTP are required' });
    }

    const otpData = req.session.otps?.[email];

    if (!otpData) {
        return res.status(400).json({ success: false, message: 'OTP not found or session expired' });
    }

    const { otp: sessionOtp, generatedAt } = otpData;
    const now = Date.now();

    if (now - generatedAt > 5 * 60 * 1000) {
        delete req.session.otps[email];
        return res.status(410).json({ success: false, message: 'OTP expired' });
    }

    if (otp !== sessionOtp) {
        return res.status(401).json({ success: false, message: 'Invalid OTP' });
    }

    // Valid OTP – clear it
    delete req.session.otps[email];

    return res.status(200).json({ success: true, message: 'OTP verified successfully' });
};

// User type configuration
const USER_TYPES = {
    student: {
        table: 'STUDENT',
        emailCol: 'STD_EMAIL',
        passCol: 'STD_PASS',
        sessionKey: 'studentMail'
    },
    teacher: {
        table: 'TEACHER',
        emailCol: 'TCH_EMAIL',
        passCol: 'TCH_PASS',
        sessionKey: 'teacherMail'
    },
    institute: {
        table: 'INSTITUTE',
        emailCol: 'INS_EMAIL',
        passCol: 'INS_PASS',
        sessionKey: 'instituteMail'
    },
    admin: {
        table: 'INSTITUTE',
        emailCol: 'AD_EMAIL',
        passCol: 'INS_PASS',
        sessionKey: 'adminMail'
    }
};

export const loginUser = async (req, res) => {
    let { userType, email, password } = req.body;

    // Validate userType
    if (!USER_TYPES[userType]) {
        return res.status(400).json({
            success: false,
            message: 'Invalid userType'
        });
    }

    const { table, emailCol, passCol, sessionKey } = USER_TYPES[userType];

    if(!email) email = req.session[sessionKey];
    
    try {
        // Use your existing db.execute function
        const result = await db.execute(
            `SELECT ${passCol} FROM ${table} WHERE ${emailCol} = :email`,
            { email }
        );

        if (result.rows.length === 0) {
            return res.json({
                success: false,
                message: 'User not found'
            });
        }

        const hashedPassword = result.rows[0][0];
        const isMatch = await bcrypt.compare(password, hashedPassword);

        if (!isMatch) {
            return res.json({
                success: false,
                message: 'Incorrect password'
            });
        }

        // Set session
        req.session[sessionKey] = email;
        req.session.userType = userType;

        return res.json({
            success: true,
            userType: userType,
            email: email
        });

    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

export const updatePassword = async (req, res) => {
    const { userType, email, pass } = req.body;

    // Validate required fields
    if (!userType || !pass) {
        return res.status(400).send("User type and password are required.");
    }

    // Get user type configuration
    const userConfig = USER_TYPES[userType.toLowerCase()];
    if (!userConfig) {
        return res.status(400).send("Invalid user type.");
    }

    // Determine email - from body or session
    let userEmail = email;

    if (!userEmail && req.session[userConfig.sessionKey]) {
        userEmail = req.session[userConfig.sessionKey];
    }
    if (!userEmail) {
        return res.status(400).send("Email is required.");
    }

    try {
        // Hash the password
        const hashPass = await bcrypt.hash(pass, 10);

        // Update password in the appropriate table
        await db.execute(
            `UPDATE ${userConfig.table} SET ${userConfig.passCol} = :hashPass WHERE ${userConfig.emailCol} = :userEmail`,
            { hashPass, userEmail },
            { autoCommit: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Password reset successfully',
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: '"Error during password update."',
        });
    }
};

export const checkSession = async (req, res) => {
    const userTypes = ['student', 'teacher', 'institute', 'admin'];

    for (const userType of userTypes) {
        const { sessionKey } = USER_TYPES[userType];
        if (req.session[sessionKey]) {
            return res.json({
                success: true,
                userType: userType,
                email: req.session[sessionKey]
            });
        }
    }

    return res.json({
        success: false,
        message: 'No active session'
    });
};

export const logout = async (req, res) => {
    try {
        const sessionId = req.sessionID;

        req.session.destroy(err => {
            if (err) {
                console.error(`Failed to destroy session ${sessionId}:`, err);
                return res.status(500).json({
                    success: false,
                    message: 'Logout failed'
                });
            }

            // Clear the session cookie with same options used in session config
            res.clearCookie('connect.sid', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                path: '/'
            });

            return res.json({
                success: true,
                message: 'Logged out successfully'
            });
        });
    } catch (error) {
        console.error('Unexpected logout error:', error);
        return res.status(500).json({
            success: false,
            message: 'Unexpected logout error'
        });
    }
};
