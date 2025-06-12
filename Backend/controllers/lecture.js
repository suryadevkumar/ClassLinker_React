import db from '../config/db.js';
import oracledb from 'oracledb';

export const uploadLecture = async (req, res) => {
    const { title, description, sub_id } = req.body;
    const videoFile = req.file?.buffer;
    const fileType = req.file?.mimetype;

    if (!videoFile) {
        return res.status(400).json({ error: 'No video file uploaded' });
    }

    try {
        await db.execute(
            `INSERT INTO SUBJECT_VIDEO (
                VIDEO_ID, SUB_ID, VIDEO_TITLE, 
                VIDEO_FILE, FILE_TYPE, UPLOAD_DATE, DESCRIPTION
            ) VALUES (
                VIDEO_ID_SEQ.NEXTVAL, :sub_id, :title,
                :videoFile, :fileType, SYSDATE, :description
            )`,
            {
                sub_id,
                title,
                videoFile: { val: videoFile, type: oracledb.BLOB },
                fileType,
                description: description || null
            },
            { autoCommit: true }
        );

        res.json({ success: true });
    } catch (err) {
        console.error('Error uploading lecture:', err);
        res.status(500).json({ error: 'Failed to upload lecture' });
    }
};

export const getLectures = async (req, res) => {
    const { sub_id } = req.query;

    try {
        const result = await db.execute(
            `SELECT 
                VIDEO_ID, VIDEO_TITLE, 
                FILE_TYPE, UPLOAD_DATE, DESCRIPTION
            FROM SUBJECT_VIDEO
            WHERE SUB_ID = :sub_id
            ORDER BY UPLOAD_DATE DESC`,
            { sub_id }
        );

        // Return only metadata, not the actual video file
        const lectures = result.rows.map(row => ({
            VIDEO_ID: row[0],
            VIDEO_TITLE: row[1],
            FILE_TYPE: row[2],
            UPLOAD_DATE: row[3],
            DESCRIPTION: row[4]
        }));

        res.json(lectures);
    } catch (err) {
        console.error('Error fetching lectures:', err);
        res.status(500).json({ error: 'Error fetching lectures' });
    }
};

export const deleteLecture = async (req, res) => {
    const { videoId } = req.params;

    try {
        await db.execute(
            `DELETE FROM SUBJECT_VIDEO WHERE VIDEO_ID = :videoId`,
            { videoId },
            { autoCommit: true }
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting lecture:', err);
        res.status(500).json({ error: 'Failed to delete lecture' });
    }
};

export const streamVideo = async (req, res) => {
    const { video_id } = req.query;

    try {
        const result = await db.execute(
            `SELECT VIDEO_FILE, FILE_TYPE FROM SUBJECT_VIDEO WHERE VIDEO_ID = :video_id`,
            { video_id }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Video not found' });
        }

        // Get the BLOB and file type
        const videoBlob = result.rows[0][0];
        const fileType = result.rows[0][1];

        // Set proper headers
        res.setHeader('Content-Type', fileType);
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Cache-Control', 'no-cache');

        // If partial content request (for seeking)
        const range = req.headers.range;
        if (range) {
            const videoSize = await videoBlob.getLength();
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : videoSize - 1;
            const chunksize = (end - start) + 1;

            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${videoSize}`,
                'Content-Length': chunksize,
            });

            // Stream partial content
            const blobStream = await videoBlob.getStream(start, chunksize);
            blobStream.on('data', (chunk) => res.write(chunk));
            blobStream.on('end', () => res.end());
        } else {
            // Stream full content
            const videoSize = await videoBlob.getLength();
            res.setHeader('Content-Length', videoSize);
            
            const blobStream = await videoBlob.getStream();
            blobStream.on('data', (chunk) => res.write(chunk));
            blobStream.on('end', () => res.end());
        }
    } catch (err) {
        console.error('Error streaming video:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Error streaming video' });
        }
    }
};