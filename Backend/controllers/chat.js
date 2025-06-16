import db from "../config/db.js";
import oracledb from 'oracledb';

// Get messages for a subject
export const getMessage = async (req, res) => {
  try {
    const { sub_id } = req.query;
    const result = await db.execute(
      `SELECT * FROM chat WHERE sub_id = :sub_id ORDER BY time ASC`,
      { sub_id }
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    const { sub_id, message } = req.body;
    const user_id = req.session.userID;
    const user_name = req.session.userName;
    const user_type = req.session.userType;

    const bindParams = {
      user_id,
      sub_id,
      message,
      user_name,
      user_type,
      out_chat_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };

    // Insert message
    const response = await db.execute(
      `INSERT INTO chat (chat_id, user_id, sub_id, message, time, user_name, user_type)
       VALUES (chat_id_seq.NEXTVAL, :user_id, :sub_id, :message, CURRENT_TIMESTAMP, :user_name, :user_type)
       RETURNING chat_id INTO :out_chat_id`,
      bindParams,
      { autoCommit: true }
    );

    const chat_id = response.outBinds.out_chat_id[0];

    // Get the inserted message
    const result = await db.execute(
      `SELECT chat_id, user_id, sub_id, message, time, user_name, user_type FROM chat WHERE chat_id = :chat_id`,
      { chat_id }
    );

    const newMessage = result.rows[0];
    
    res.json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};