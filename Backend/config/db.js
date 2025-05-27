import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_STRING
};

const initialize = async () => {
    await oracledb.createPool(dbConfig);
    console.log('Oracle pool created');
}

const close = async () => {
    await oracledb.getPool().close();
    console.log('Oracle pool closed');
}

const execute = async (sql, binds = [], options = {}) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(sql, binds, options);
        return result;
    } catch (err) {
        console.error('Error executing SQL:', err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
}

export default {
    initialize,
    close,
    execute
};