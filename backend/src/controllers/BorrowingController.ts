import type { Request, Response } from 'express';
import pool from '../utils/db';
import type { Borrowing } from '../models/Borrowing';

export class BorrowingController {
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const { userId, bookId, date, returned } = req.query;

            let whereClause = '';
            const params: any[] = [];

            if (userId) {
                whereClause += 'WHERE b.user_id = ? ';
                params.push(userId);
            }

            if (bookId) {
                whereClause += whereClause ? 'AND ' : 'WHERE ';
                whereClause += 'b.book_id = ? ';
                params.push(bookId);
            }

            if (date) {
                whereClause += whereClause ? 'AND ' : 'WHERE ';
                whereClause += 'DATE(b.borrow_date) = ? ';
                params.push(date);
            }

            if (returned !== undefined) {
                whereClause += whereClause ? 'AND ' : 'WHERE ';
                if (returned === 'true') {
                    whereClause += 'b.return_date IS NOT NULL ';
                } else {
                    whereClause += 'b.return_date IS NULL ';
                }
            }

            const [rows] = await pool.query(
                `
        SELECT 
          b.*,
          u.name AS user_name,
          bk.title AS book_title,
          bk.author AS book_author
        FROM 
          borrowings b
        JOIN 
          users u ON b.user_id = u.id
        JOIN 
          books bk ON b.book_id = bk.id
        ${whereClause}
        ORDER BY 
          b.borrow_date DESC
        `,
                params
            );

            res.json(rows);
        } catch (error) {
            console.error('Error getting borrowings:', error);
            res.status(500).json({ message: 'Error retrieving borrowings' });
        }
    }

    async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const [rows] = await pool.query(
                `
        SELECT 
          b.*,
          u.name AS user_name,
          bk.title AS book_title,
          bk.author AS book_author
        FROM 
          borrowings b
        JOIN 
          users u ON b.user_id = u.id
        JOIN 
          books bk ON b.book_id = bk.id
        WHERE 
          b.id = ?
        `,
                [id]
            );

            if ((rows as any[]).length === 0) {
                res.status(404).json({ message: 'Borrowing record not found' });
                return;
            }

            res.json((rows as any[])[0]);
        } catch (error) {
            console.error('Error getting borrowing:', error);
            res.status(500).json({ message: 'Error retrieving borrowing' });
        }
    }

    async create(req: Request, res: Response): Promise<void> {
        try {
            const { user_id, book_id, borrow_date, due_date } = req.body as Borrowing;

            if (!user_id || !book_id || !borrow_date || !due_date) {
                res.status(400).json({ message: 'Missing required fields' });
                return;
            }

            const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [user_id]);
            if ((user as any[]).length === 0) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            const [book] = await pool.query('SELECT * FROM books WHERE id = ?', [book_id]);
            if ((book as any[]).length === 0) {
                res.status(404).json({ message: 'Book not found' });
                return;
            }

            const [activeBorrowing] = await pool.query(
                `
        SELECT * FROM borrowings 
        WHERE book_id = ? AND return_date IS NULL
        `,
                [book_id]
            );

            if ((activeBorrowing as any[]).length > 0) {
                res.status(400).json({ message: 'This book is already borrowed' });
                return;
            }

            const result = await pool.query(
                `
        INSERT INTO borrowings (
          user_id, book_id, borrow_date, due_date
        ) VALUES (?, ?, ?, ?)
        `,
                [user_id, book_id, borrow_date, due_date]
            );

            const id = (result[0] as any).insertId;

            await pool.query(
                'UPDATE books SET status = ? WHERE id = ?',
                ['in-progress', book_id]
            );

            res.status(201).json({
                id,
                user_id,
                book_id,
                borrow_date,
                due_date
            });
        } catch (error) {
            console.error('Error creating borrowing record:', error);
            res.status(500).json({ message: 'Error creating borrowing record' });
        }
    }

    async returnBook(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { return_date = new Date() } = req.body;

            const [borrowing] = await pool.query(
                'SELECT * FROM borrowings WHERE id = ?',
                [id]
            );

            if ((borrowing as any[]).length === 0) {
                res.status(404).json({ message: 'Borrowing record not found' });
                return;
            }

            if ((borrowing as any[])[0].return_date) {
                res.status(400).json({ message: 'This book is already returned' });
                return;
            }

            await pool.query(
                'UPDATE borrowings SET return_date = ? WHERE id = ?',
                [return_date, id]
            );

            const bookId = (borrowing as any[])[0].book_id;

            await pool.query(
                'UPDATE books SET status = ? WHERE id = ?',
                ['completed', bookId]
            );

            const [updatedBorrowing] = await pool.query(
                `
        SELECT 
          b.*,
          u.name AS user_name,
          bk.title AS book_title
        FROM 
          borrowings b
        JOIN 
          users u ON b.user_id = u.id
        JOIN 
          books bk ON b.book_id = bk.id
        WHERE 
          b.id = ?
        `,
                [id]
            );

            res.json((updatedBorrowing as any[])[0]);
        } catch (error) {
            console.error('Error returning book:', error);
            res.status(500).json({ message: 'Error returning book' });
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const [borrowing] = await pool.query(
                'SELECT * FROM borrowings WHERE id = ?',
                [id]
            );

            if ((borrowing as any[]).length === 0) {
                res.status(404).json({ message: 'Borrowing record not found' });
                return;
            }

            await pool.query('DELETE FROM borrowings WHERE id = ?', [id]);

            res.status(204).send();
        } catch (error) {
            console.error('Error deleting borrowing record:', error);
            res.status(500).json({ message: 'Error deleting borrowing record' });
        }
    }

    async getOverdue(req: Request, res: Response): Promise<void> {
        try {
            const [rows] = await pool.query(
                `
        SELECT 
          b.id AS borrowing_id,
          b.borrow_date,
          b.due_date,
          DATEDIFF(CURRENT_DATE(), b.due_date) AS days_overdue,
          u.id AS user_id,
          u.name AS user_name,
          u.email AS user_email,
          bk.id AS book_id,
          bk.title AS book_title,
          bk.author AS book_author
        FROM 
          borrowings b
        JOIN 
          users u ON b.user_id = u.id
        JOIN 
          books bk ON b.book_id = bk.id
        WHERE 
          b.return_date IS NULL AND 
          b.due_date < CURRENT_DATE()
        ORDER BY 
          days_overdue DESC
        `
            );

            res.json(rows);
        } catch (error) {
            console.error('Error getting overdue books:', error);
            res.status(500).json({ message: 'Error retrieving overdue books' });
        }
    }

    async getByDate(req: Request, res: Response): Promise<void> {
        try {
            const { date } = req.query;

            if (!date) {
                res.status(400).json({ message: 'Date parameter is required' });
                return;
            }

            const [rows] = await pool.query(
                `
        SELECT 
          b.id,
          b.borrow_date,
          b.due_date,
          b.return_date,
          u.name AS user_name,
          bk.title AS book_title,
          bk.author AS book_author
        FROM 
          borrowings b
        JOIN 
          users u ON b.user_id = u.id
        JOIN 
          books bk ON b.book_id = bk.id
        WHERE 
          DATE(b.borrow_date) = ?
        ORDER BY 
          b.borrow_date
        `,
                [date]
            );

            res.json(rows);
        } catch (error) {
            console.error('Error getting borrowings by date:', error);
            res.status(500).json({ message: 'Error retrieving borrowings by date' });
        }
    }
}