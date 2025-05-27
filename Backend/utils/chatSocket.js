import db from '../config/db.js';
import oracledb from 'oracledb';

function initializeSocket(io) {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Verify access to subject
    const verifySubjectAccess = async (userId, userType, subjectId) => {
      let sql;
      const binds = [subjectId, userId];
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
      const result = await db.execute(sql, binds);
      return result.rows.length > 0;
    };

    // Save chat message
    const saveChatMessage = async (userId, subjectId, message, userName, userType) => {
      const sql = `
        INSERT INTO CHAT (CHAT_ID, USER_ID, SUB_ID, MESSAGE, USER_NAME, USER_TYPE) 
        VALUES (CHAT_ID_SEQ.NEXTVAL, :userId, :subjectId, :message, :userName, :userType) 
        RETURNING CHAT_ID, TO_CHAR(TIME, 'YYYY-MM-DD HH24:MI:SS') AS TIME INTO :chatId, :time
      `;
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
      return {
        chatId: result.outBinds.chatId[0],
        time: result.outBinds.time[0]
      };
    };

    // Join subject room
    socket.on('joinSubject', async ({ subjectId, userId, userType }) => {
      try {
        const hasAccess = await verifySubjectAccess(userId, userType, subjectId);
        if (!hasAccess) {
          socket.emit('error', 'Access denied');
          return;
        }

        socket.join(`subject_${subjectId}`);
        console.log(`User ${userId} joined subject ${subjectId}`);
      } catch (error) {
        console.error('Error joining subject:', error);
        socket.emit('error', 'Internal server error');
      }
    });

    // Handle new messages
    socket.on('sendMessage', async ({ subjectId, userId, userName, userType, message }) => {
      try {
        const hasAccess = await verifySubjectAccess(userId, userType, subjectId);
        if (!hasAccess) {
          socket.emit('error', 'Access denied');
          return;
        }

        const { chatId, time } = await saveChatMessage(userId, subjectId, message, userName, userType);

        io.to(`subject_${subjectId}`).emit('newMessage', {
          chatId,
          userId,
          userName,
          userType,
          subjectId,
          message,
          time
        });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', 'Failed to send message');
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}

export default initializeSocket;