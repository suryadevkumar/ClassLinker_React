import db from '../config/db.js';
import oracledb from 'oracledb';

export const uploadLecture = async (req, res) => {
    const { title, description, sub_id } = req.body;
    const videoFile = req.file?.buffer;
    const fileType = req.file?.mimetype;

    if (!videoFile) {
        return res.status(400).json({ error: 'No video file uploaded' });
    }

    if (!videoFile.length || videoFile.length === 0) {
        return res.status(400).json({ error: 'Empty file uploaded' });
    }

    // Ensure we have the file size
    const fileSize = videoFile.length;
    
    if (!fileSize) {
        return res.status(400).json({ error: 'Could not determine file size' });
    }

    try {
        
        const result = await db.execute(
            `INSERT INTO SUBJECT_VIDEO (
                VIDEO_ID, SUB_ID, VIDEO_TITLE, 
                VIDEO_FILE, FILE_TYPE, UPLOAD_DATE, DESCRIPTION, FILE_SIZE
            ) VALUES (
                VIDEO_ID_SEQ.NEXTVAL, :sub_id, :title,
                :videoFile, :fileType, SYSDATE, :description, :fileSize
            )`,
            {
                sub_id: parseInt(sub_id),
                title: title,
                videoFile: { val: videoFile, type: oracledb.BLOB },
                fileType: fileType,
                description: description || null,
                fileSize: fileSize
            },
            { autoCommit: true }
        );

        // Verify the insertion by checking what was actually stored
        const verifyResult = await db.execute(
            `SELECT VIDEO_ID, FILE_SIZE FROM SUBJECT_VIDEO 
             WHERE SUB_ID = :sub_id AND VIDEO_TITLE = :title 
             ORDER BY UPLOAD_DATE DESC`,
            { sub_id: parseInt(sub_id), title: title }
        );

        res.json({ 
            success: true, 
            message: 'Lecture uploaded successfully',
            fileSize: fileSize,
            videoId: verifyResult.rows.length > 0 ? verifyResult.rows[0][0] : null
        });
        
    } catch (err) {
        console.error('Error uploading lecture:', err);
        console.error('Error details:', {
            code: err.code,
            message: err.message,
            offset: err.offset
        });
        res.status(500).json({ 
            error: 'Failed to upload lecture',
            details: err.message 
        });
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
        let fileSize = result.rows[0][2];

        // Set headers
        res.setHeader('Content-Type', fileType);
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Accept-Ranges', 'bytes');

        const range = req.headers.range;
        
        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            
            if (start >= fileSize) {
                return res.status(416)
                    .setHeader('Content-Range', `bytes */${fileSize}`)
                    .end();
            }
            
            const chunkSize = (end - start) + 1;
            
            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Content-Length': chunkSize,
                'Content-Type': fileType
            });
            
            // Use smaller chunks for better memory management
            const chunkSizeToRead = 1024 * 256; // 256KB chunks
            let bytesRead = 0;
            
            while (bytesRead < chunkSize) {
                const currentStart = start + bytesRead;
                const currentEnd = Math.min(currentStart + chunkSizeToRead - 1, end);
                const currentChunkSize = currentEnd - currentStart + 1;
                
                try {
                    const chunk = await new Promise((resolve, reject) => {
                        videoBlob.getData(currentStart + 1, currentChunkSize, (err, data) => {
                            if (err) reject(err);
                            else resolve(data);
                        });
                    });
                    
                    if (!res.write(chunk)) {
                        // Handle backpressure
                        await new Promise(resolve => res.once('drain', resolve));
                    }
                    bytesRead += currentChunkSize;
                } catch (chunkError) {
                    console.error('Error streaming BLOB chunk:', chunkError);
                    res.end();
                    return;
                }
            }
            
            res.end();
            return;
        }
        
        // For non-range requests (should be avoided for large files)
        try {
            const fullData = await new Promise((resolve, reject) => {
                videoBlob.getData(1, fileSize || undefined, (err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            });

            if (!fileSize || fileSize <= 0) {
                fileSize = fullData.length;
                await db.execute(
                    `UPDATE SUBJECT_VIDEO SET FILE_SIZE = :fileSize WHERE VIDEO_ID = :video_id`,
                    { fileSize, video_id },
                    { autoCommit: true }
                );
            }

            res.setHeader('Content-Length', fileSize);
            res.end(fullData);
        } catch (streamError) {
            console.error('Error streaming full file:', streamError);
            if (!res.headersSent) {
                res.status(500).json({ 
                    error: 'Failed to stream video',
                    details: streamError.message 
                });
            }
        }
    } catch (err) {
        console.error('Error in streamVideo:', err);
        if (!res.headersSent) {
            res.status(500).json({ 
                error: 'Database error while streaming video',
                details: err.message 
            });
        }
    }
};