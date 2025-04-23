import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../util/jwt';
import User from '../models/User';

const AuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        if (!token) throw new Error("Token is not present");

        const decoded = verifyToken(token);
        const user = await getUser(Number(decoded));

        if (!user) throw new Error('Invalid user');

        req.user = user;
        next();
    } catch (err) {
        console.error(err);
        res.status(401).json({ message: 'Invalid or expired token' });
        return;
    }
};

const getUser = async (id: number) => {
    const model = new User();
    return await model.find(id);
};

export default AuthMiddleware;
