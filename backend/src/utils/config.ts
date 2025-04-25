import dotenv from 'dotenv';

dotenv.config();

export const config = {
    server: {
        port: process.env.PORT || 6969
    },
    db: {
        host: process.env.DB_HOST || 'db',
        user: process.env.DB_USER || 'ana',
        password: process.env.DB_PASSWORD || 'nta',
        database: process.env.DB_NAME || 'devbook',
        port: Number(process.env.DB_PORT) || 3306,
        waitForConnections: true
    },
    auth: {
        jwtSecret: process.env.JWT_SECRET || 'devbook-secret-key',
        expiresIn: '24h'
    }
};