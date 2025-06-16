import db from '../config/db.js';
import oracledb from 'oracledb';

//Routes to load assignment
export const getAssignmentList = async (req, res) => {
    const { sub_id } = req.body;

    try {
        const result = await db.execute(
            `SELECT as_id, as_name, TO_CHAR(due_date, 'YYYY-MM-DD HH24:MI') as due_date 
             FROM assignment 
             WHERE sub_id = :subId`,
            { subId: sub_id }
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching assignment:', err);
        res.status(500).json({ error: 'Error fetching assignments' });
    }
};

//Routes to upload assignment
export const uploadAssignment = async (req, res) => {
  const { assignmentTitle, sub_id, dueDate } = req.body;
  const assignmentFile = req.file?.buffer;
  const fileType = req.file?.mimetype;
  console.log(req.body, assignmentFile, fileType)

  try {
    const result = await db.execute(
      `INSERT INTO assignment (as_id, as_name, as_file, file_type, sub_id, due_date) 
       VALUES (assignment_id_seq.NEXTVAL, :assignmentTitle, :assignmentFile, :fileType, :sub_id, TO_DATE(:dueDate, 'YYYY-MM-DD"T"HH24:MI'))`, {
      assignmentTitle: assignmentTitle,
      assignmentFile: { val: assignmentFile, type: oracledb.BLOB },
      fileType: fileType,
      sub_id: sub_id,
      dueDate: dueDate
    }, { autoCommit: true });

    res.json({ success: true });
  } catch (err) {
    console.error('Error uploading assignment:', err);
    res.status(500).json({ error: 'Failed to upload assignment' });
  }
};

//download assignment
export const downloadAssignment = async (req, res) => {
    const { assignId } = req.query;
    try {
        const result = await db.execute(
            `SELECT as_name, as_file, file_type FROM assignment WHERE as_id = :assignId`,
            { assignId: assignId }
        );

        if (!result.rows || result.rows.length === 0) {
            return res.status(404).send('Assignment not found');
        }

        const assignment = result.rows[0];
        const fileName = assignment[0];
        const fileData = assignment[1];
        const fileType = assignment[2];

        if (fileData) {
            const buffer = await fileData.getData();
            res.setHeader('Content-Type', fileType || 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
            res.send(buffer);
        } else {
            return res.status(404).send('File data not found');
        }
    } catch (err) {
        console.error('Error downloading file:', err);
        return res.status(500).send('Internal server error');
    }
};

//delete assignment
export const deleteAssignment = async (req, res) => {
    const { assignmentId } = req.query;

    try {
        const result = await db.execute(
            `DELETE FROM assignment WHERE as_id = :assignmentId`,
            { assignmentId: assignmentId },
            { autoCommit: true }
        );
        res.send('Assignment deleted successfully');
    } catch (err) {
        console.error('Error deleting assignment:', err);
    }
};

export const submitAssignment = async (req, res) => {
  const { as_id } = req.body;
  const std_id = req.session.std_id;
  const pdfFile = req.file?.buffer;
  const fileType = req.file?.mimetype;

  try {
    // Check if already submitted
    const checkResult = await db.execute(
      `SELECT 1 FROM std_assignment_submit 
       WHERE std_id = :std_id AND as_id = :as_id`,
      { std_id , as_id }
    );

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: 'Assignment already submitted' });
    }

    await db.execute(
      `INSERT INTO std_assignment_submit 
       (submit_id, std_id, as_id, pdf_file, file_type) 
       VALUES (submit_id_seq.NEXTVAL, :std_id, :as_id, :pdf_file, :file_type)`,
      {
        std_id,
        as_id,
        pdf_file: { val: pdfFile, type: oracledb.BLOB },
        file_type: fileType
      },
      { autoCommit: true }
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Error submitting assignment:', err);
    res.status(500).json({ error: 'Error submitting assignment' });
  }
};

// In your backend controllers (assignment.js)
export const getStudentSubmissions = async (req, res) => {
  const { as_id } = req.body;
  const std_id = req.session.std_id;

  // Validate input
  if (!std_id || !as_id) {
    return res.status(400).json({ error: 'Missing student ID or assignment ID' });
  }

  try {
    const result = await db.execute(
  `SELECT 
     submit_id, 
     submit_date,
     grade, 
     feedback 
   FROM std_assignment_submit 
   WHERE std_id = :std_id AND as_id = :as_id
   ORDER BY submit_date DESC`,
  { std_id, as_id }
);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ error: 'Error fetching submissions' });
  }
};

export const downloadSubmittedAssignment = async (req, res) => {
  const { submitId } = req.query;
  
  try {
    const result = await db.execute(
      `SELECT pdf_file, file_type 
       FROM std_assignment_submit 
       WHERE submit_id = :submitId`,
      { submitId }
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).send('Submission not found');
    }

    const submission = result.rows[0];
    const fileData = submission[0];
    const fileType = submission[1];

    if (fileData) {
      const buffer = await fileData.getData();
      res.setHeader('Content-Type', fileType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="submission_${submitId}"`);
      res.send(buffer);
    } else {
      return res.status(404).send('File data not found');
    }
  } catch (err) {
    console.error('Error downloading submission:', err);
    return res.status(500).send('Internal server error');
  }
};

export const getSubmittedAssignments = async (req, res) => {
  const { assignmentId } = req.query;

  try {
    const result = await db.execute(
      `SELECT 
        s.submit_id,
        st.sch_id,
        st.std_name,
        s.submit_date,
        s.grade,
        s.feedback
      FROM std_assignment_submit s
      JOIN student st ON s.std_id = st.std_id
      WHERE s.as_id = :assignmentId
      ORDER BY st.sch_id ASC`,
      { assignmentId }
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching submitted assignments:', err);
    res.status(500).json({ error: 'Error fetching submitted assignments' });
  }
};

export const viewStudentAssignment = async (req, res) => {
  const { submitId } = req.query;

  try {
    const result = await db.execute(
      `SELECT pdf_file, file_type 
       FROM std_assignment_submit 
       WHERE submit_id = :submitId`,
      { submitId }
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).send('Submission not found');
    }

    const submission = result.rows[0];
    const fileData = submission[0];
    const fileType = submission[1];

    if (fileData) {
      const buffer = await fileData.getData();
      res.setHeader('Content-Type', fileType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="submission_${submitId}"`);
      res.send(buffer);
    } else {
      return res.status(404).send('File data not found');
    }
  } catch (err) {
    console.error('Error viewing submission:', err);
    return res.status(500).send('Internal server error');
  }
};
