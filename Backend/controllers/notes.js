import db from '../config/db.js';
import oracledb from 'oracledb';

//Routes to load notes
export const getNotesList = async (req, res) => {
    const { sub_id } = req.body;
    try {
        const result = await db.execute(
            `SELECT notes_id, notes_name FROM notes WHERE sub_id = :subId`,
            { subId: sub_id }
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching notes:', err);
    }
};

//Routes to upload notes
export const uploadNotes = async (req, res) => {
    const { notesTitle, sub_id } = req.body;
    const notesFile = req.file?.buffer;
    const fileType = req.file?.mimetype;

    try {
        const result = await db.execute(
            `INSERT INTO notes (notes_id, notes_name, notes_file, file_type, sub_id) 
             VALUES (notes_id_seq.NEXTVAL, :notesTitle, :notesFile, :fileType, :sub_id)`, {
            notesTitle: notesTitle,
            notesFile: { val: notesFile, type: oracledb.BLOB },
            fileType: fileType,
            sub_id: sub_id
        }, { autoCommit: true });

        res.json({ success: true });
    } catch (err) {
        console.error('Error uploading note:', err);
    }
};

// //download notes
export const downloadNote = async (req, res) => {
    const { noteId } = req.query;
    try {
        const result = await db.execute(
            `SELECT notes_name, notes_file, file_type FROM notes WHERE notes_id = :noteId`,
            { noteId: noteId }
        );

        const note = result.rows[0];
        const fileName = note[0];
        const fileData = note[1];
        const fileType = note[2];

        if (fileData) {
            const buffer = await fileData.getData();
            res.setHeader('Content-Type', fileType);
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.send(buffer);
        } else {
            return res.status(500).send('File data is missing or corrupted');
        }
    } catch (err) {
        console.error('Error downloading file:', err);
        return res.status(500).send('Internal server error');
    }
};

//delete notes
export const deleteNote = async (req, res) => {
    const { noteId } = req.query;

    try {
        const result = await db.execute(
            `DELETE FROM notes WHERE notes_id = :noteId`,
            { noteId: noteId },
            { autoCommit: true }
        );
        res.send('Note deleted successfully');
    } catch (err) {
        console.error('Error deleting note:', err);
    } 
};