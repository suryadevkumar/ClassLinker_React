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
                VIDEO_FILE, FILE_TYPE, UPLOAD_DATE, DESCRIPTION, FILE_SIZE
            ) VALUES (
                VIDEO_ID_SEQ.NEXTVAL, :sub_id, :title,
                :videoFile, :fileType, SYSDATE, :description, :fileSize
            )`,
            {
                sub_id,
                title,
                videoFile: { val: videoFile, type: oracledb.BLOB },
                fileType,
                description: description || null,
                fileSize: videoFile.length
            },
            { autoCommit: true }
        );

        res.json({ success: true, message: 'Lecture uploaded successfully' });
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
                FILE_TYPE, UPLOAD_DATE, DESCRIPTION, FILE_SIZE
            FROM SUBJECT_VIDEO
            WHERE SUB_ID = :sub_id
            ORDER BY UPLOAD_DATE DESC`,
            { sub_id }
        );

        const lectures = result.rows.map(row => ({
            VIDEO_ID: row[0],
            VIDEO_TITLE: row[1],
            FILE_TYPE: row[2],
            UPLOAD_DATE: row[3],
            DESCRIPTION: row[4],
            FILE_SIZE: row[5]
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
            `SELECT VIDEO_FILE, FILE_TYPE, FILE_SIZE FROM SUBJECT_VIDEO WHERE VIDEO_ID = :video_id`,
            { video_id }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Video not found' });
        }

        const videoBlob = result.rows[0][0];
        const fileType = result.rows[0][1] || 'video/mp4';
        const fileSize = result.rows[0][2] || await videoBlob.getLength();

        // Set proper headers for video streaming
        res.setHeader('Content-Type', fileType);
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Disposition', 'inline');

        const range = req.headers.range;
        
        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = (end - start) + 1;

            if (start >= fileSize || end >= fileSize) {
                res.status(416).setHeader('Content-Range', `bytes */${fileSize}`);
                return res.end();
            }

            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Content-Length': chunkSize,
                'Content-Type': fileType
            });

            try {
                const chunk = await new Promise((resolve, reject) => {
                    const chunks = [];
                    const blobStream = videoBlob.createReadStream({ 
                        offset: start + 1,
                        length: chunkSize 
                    });
                    
                    blobStream.on('data', (data) => chunks.push(data));
                    blobStream.on('end', () => resolve(Buffer.concat(chunks)));
                    blobStream.on('error', reject);
                });

                res.end(chunk);
            } catch (streamError) {
                console.error('Error streaming chunk:', streamError);
                if (!res.headersSent) {
                    res.status(500).end();
                }
            }
        } else {
            res.setHeader('Content-Length', fileSize);
            
            try {
                const fullStream = videoBlob.createReadStream();
                fullStream.pipe(res);
                
                fullStream.on('error', (streamError) => {
                    console.error('Error streaming full video:', streamError);
                    if (!res.headersSent) {
                        res.status(500).end();
                    }
                });
            } catch (streamError) {
                console.error('Error creating stream:', streamError);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Error streaming video' });
                }
            }
        }
    } catch (err) {
        console.error('Error streaming video:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Error streaming video' });
        }
    }
};