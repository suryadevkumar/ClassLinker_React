import db from "../config/db";

// Get messages for a subject
export const getMessage= async (req, res) => {
  try {
    const { sub_id } = req.query;
    const result = await db.execute(
      `SELECT * FROM chat 
       WHERE sub_id = $1 
       ORDER BY time ASC`,
      [sub_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    const { user_id, sub_id, message, user_name, user_type } = req.body;

    const result = await db.execute(
      `INSERT INTO chat 
       (user_id, sub_id, message, user_name, user_type, time)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       RETURNING *`,
      [user_id, sub_id, message, user_name, user_type]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};