import type { RowDataPacket } from "mysql2";
import db from "./db";
import fs from 'fs';

interface QueryResult extends RowDataPacket {
    count: number;
}

const checkConn = async () => {
    try {
        const connection = await db.getConnection();
        console.log('Database connection successful');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
}


const initDB = async () => {
    await checkConn().then(async () => {
        try {

            try {
                await fs.promises.access('/app/src/utils/script.sql');
            } catch (err) {
                console.error("SQL file not found at:", '/app/src/utils/script.sql');
                console.error("Current working directory:", process.cwd());
                console.log("Directory contents:", await fs.promises.readdir('/app/src/utils'));
                throw err;
            }

            const [rows] = await db.execute<QueryResult[]>("SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ?", [process.env.DB_NAME]);

            const tableCount = rows[0]?.count;

            if (tableCount === 0) {
                console.log('Empty Database');

                const sql = fs.readFileSync('/app/src/utils/script.sql', 'utf8');

                const queries = sql.split(';').filter(query => query.trim() !== '');

                for (const query of queries) {
                    await db.execute(query);
                }

                console.log('Database initialized');
            } else {
                console.log('Database already has data');
            }

        } catch (error) {
            console.error("Error initializing database:", error);
        }
    })
}

export default initDB;