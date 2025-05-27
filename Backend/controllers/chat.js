import db from '../config/db.js';
import oracledb from 'oracledb';

export const getChatHistory = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const { userId, userType } = req.user;

        // Verify access
        const hasAccess = await (async () => {
            let sql;
            if (userType === 'teacher') {
                sql = `SELECT 1 FROM SUBJECT WHERE SUB_ID = :subjectId AND TCH_ID = :userId`;
            } else {
                sql = `
            SELECT 1 FROM STUDENT ST
            JOIN IDCC ID ON ST.IDCC_ID = ID.IDCC_ID
            JOIN SUBJECT SU ON SU.IDCC_ID = ID.IDCC_ID
            WHERE SU.SUB_ID = :subjectId AND ST.STD_ID = :userId
          `;
            }
            const result = await db.execute(sql, [subjectId, userId]);
            return result.rows.length > 0;
        })();

        if (!hasAccess) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Fetch chat history
        const sql = `SELECT * FROM CHAT WHERE SUB_ID = :subjectId ORDER BY TIME ASC`;
        const result = await db.execute(sql, [subjectId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getParticipants = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const { userId, userType } = req.user;

        // Verify access
        const hasAccess = await (async () => {
            let sql;
            if (userType === 'teacher') {
                sql = `SELECT 1 FROM SUBJECT WHERE SUB_ID = :subjectId AND TCH_ID = :userId`;
            } else {
                sql = `
            SELECT 1 FROM STUDENT ST
            JOIN IDCC ID ON ST.IDCC_ID = ID.IDCC_ID
            JOIN SUBJECT SU ON SU.IDCC_ID = ID.IDCC_ID
            WHERE SU.SUB_ID = :subjectId AND ST.STD_ID = :userId
          `;
            }
            const result = await db.execute(sql, [subjectId, userId]);
            return result.rows.length > 0;
        })();

        if (!hasAccess) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Fetch participants
        const sql = `
        SELECT T.TCH_ID AS ID, T.TCH_NAME AS NAME, 'teacher' AS TYPE, T.TCH_EMAIL AS EMAIL
        FROM SUBJECT S
        JOIN TEACHER T ON S.TCH_ID = T.TCH_ID
        WHERE S.SUB_ID = :subjectId
        UNION
        SELECT ST.STD_ID AS ID, ST.STD_NAME AS NAME, 'student' AS TYPE, ST.STD_EMAIL AS EMAIL
        FROM SUBJECT SU
        JOIN IDCC ID ON SU.IDCC_ID = ID.IDCC_ID
        JOIN STUDENT ST ON ST.IDCC_ID = ID.IDCC_ID
        WHERE SU.SUB_ID = :subjectId
      `;
        const result = await db.execute(sql, [subjectId, subjectId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching participants:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const saveChatMessage = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const { message, userName, userType } = req.body;
        const { userId } = req.user;

        // Verify access
        const hasAccess = await (async () => {
            let sql;
            if (userType === 'teacher') {
                sql = `SELECT 1 FROM SUBJECT WHERE SUB_ID = :subjectId AND TCH_ID = :userId`;
            } else {
                sql = `
            SELECT 1 FROM STUDENT ST
            JOIN IDCC ID ON ST.IDCC_ID = ID.IDCC_ID
            JOIN SUBJECT SU ON SU.IDCC_ID = ID.IDCC_ID
            WHERE SU.SUB_ID = :subjectId AND ST.STD_ID = :userId
          `;
            }
            const result = await db.execute(sql, [subjectId, userId]);
            return result.rows.length > 0;
        })();

        if (!hasAccess) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Save chat message
        const sql = `INSERT INTO CHAT (CHAT_ID, USER_ID, SUB_ID, MESSAGE, USER_NAME, USER_TYPE) 
                   VALUES (CHAT_ID_SEQ.NEXTVAL, :userId, :subjectId, :message, :userName, :userType) 
                   RETURNING CHAT_ID, TO_CHAR(TIME, 'YYYY-MM-DD HH24:MI:SS') AS TIME INTO :chatId, :time`;
        const binds = {
            userId,
            subjectId,
            message,
            userName,
            userType,
            chatId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
            time: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
        };
        const result = await db.execute(sql, binds);
        res.json({
            chatId: result.outBinds.chatId[0],
            time: result.outBinds.time[0]
        });
    } catch (error) {
        console.error('Error saving chat message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
