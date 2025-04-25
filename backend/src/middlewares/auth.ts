import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../utils/config';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) : void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Authentication token required' });
            return;
        }

        const token = authHeader.split(' ')[1] ?? '';

        const decoded = jwt.verify(token, config.auth.jwtSecret);

        (req as any).user = decoded;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};