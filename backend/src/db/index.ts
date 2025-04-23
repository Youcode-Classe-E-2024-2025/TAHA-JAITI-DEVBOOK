import mysql from 'mysql2/promise';
import dontenv from 'dotenv';

dontenv.config();

const db = mysql.createPool({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'ana',
    password: process.env.DB_PASSWORD || 'nta',
    database: process.env.DB_NAME || 'devbook',
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true
})

export default db;
