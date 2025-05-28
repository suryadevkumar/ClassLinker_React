import db from "../config/db.js";

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