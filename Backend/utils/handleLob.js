const handleLob = (stdPic) => {
    return new Promise((resolve, reject) => {
        let chunks = [];
        stdPic.on('data', (chunk) => {
            chunks.push(chunk);
        });

        stdPic.on('end', () => {
            const buffer = Buffer.concat(chunks);
            const base64AdPic = buffer.toString('base64');
            resolve(base64AdPic);
        });

        stdPic.on('error', (err) => {
            console.error('LOB streaming error:', err);
            reject(err);
        });
    });
};

export default handleLob;