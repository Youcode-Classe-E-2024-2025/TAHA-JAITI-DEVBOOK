import type { Request, Response } from 'express';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import pool from '../utils/db';
import { config } from '../utils/config';

export class AuthController {
    async register(req: Request, res: Response): Promise<void> {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                res.status(400).json({ message: 'All fields are required' });
                return;
            }

            const [existingUser] = await pool.query(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            if ((existingUser as any[]).length > 0) {
                res.status(409).json({ message: 'User with this email already exists' });
                return;
            }

            const hash = await bcrypt.hash(password, 10);

            const result = await pool.query(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                [name, email, hash]
            );

            const userId = (result[0] as any).insertId;

            const token = jwt.sign(
                { id: userId, email, name },
                config.auth.jwtSecret,
            );

            res.status(201).json({
                user: {
                    id: userId,
                    name,
                    email
                },
                token
            });
        } catch (error) {
            console.error('Error registering user:', error);
            res.status(500).json({ message: 'Error registering user' });
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({ message: 'Email and password are required' });
                return;
            }

            const [users] = await pool.query(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            if ((users as any[]).length === 0) {
                res.status(401).json({ message: 'Invalid credentials' });
                return;
            }

            const user = (users as any[])[0];

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                res.status(401).json({ message: 'Invalid credentials' });
                return;
            }

            const token = jwt.sign(
                { id: user.id, email: user.email, name: user.name },
                config.auth.jwtSecret,
            );

            res.json({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                },
                token
            });
        } catch (error) {
            console.error('Error logging in:', error);
            res.status(500).json({ message: 'Error logging in' });
        }
    }

    async getProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.id;

            const [users] = await pool.query(
                'SELECT id, name, email, created_at FROM users WHERE id = ?',
                [userId]
            );

            if ((users as any[]).length === 0) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            res.json((users as any[])[0]);
        } catch (error) {
            console.error('Error getting user profile:', error);
            res.status(500).json({ message: 'Error retrieving user profile' });
        }
    }
}