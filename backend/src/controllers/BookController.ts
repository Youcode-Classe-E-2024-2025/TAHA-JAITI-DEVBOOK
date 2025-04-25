import type { Request, Response } from 'express';
import pool from '../utils/db';
import type { Book } from '../models/Book';

export class BookController {
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const {
                category,
                difficulty,
                status,
                sort = 'title',
                order = 'asc',
                page = 1,
                limit = 10
            } = req.query;

            const offset = (Number(page) - 1) * Number(limit);

            let whereClause = '';
            const params: any[] = [];

            if (category) {
                whereClause += 'WHERE category_id = ? ';
                params.push(category);
            }

            if (difficulty) {
                whereClause += whereClause ? 'AND ' : 'WHERE ';
                whereClause += 'difficulty = ? ';
                params.push(difficulty);
            }

            if (status) {
                whereClause += whereClause ? 'AND ' : 'WHERE ';
                whereClause += 'status = ? ';
                params.push(status);
            }

            const validSortFields = ['title', 'author', 'status', 'difficulty', 'publication_date'];
            const sortField = validSortFields.includes(String(sort)) ? sort : 'title';

            const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

            const query = `
        SELECT 
          b.*, 
          c.name as category_name 
        FROM 
          books b
        LEFT JOIN 
          categories c ON b.category_id = c.id
        ${whereClause}
        ORDER BY 
          ${sortField} ${sortOrder}
        LIMIT ? OFFSET ?
      `;

            params.push(Number(limit), offset);

            const [rows] = await pool.query(query, params);

            const [countResult] = await pool.query(
                `SELECT COUNT(*) as total FROM books ${whereClause}`,
                whereClause ? params.slice(0, -2) : []
            );
            const total = (countResult as any)[0].total;

            res.json({
                data: rows,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit))
                }
            });
        } catch (error) {
            console.error('Error getting books:', error);
            res.status(500).json({ message: 'Error retrieving books' });
        }
    }

    async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const [rows] = await pool.query(
                `
        SELECT 
          b.*, 
          c.name as category_name 
        FROM 
          books b
        LEFT JOIN 
          categories c ON b.category_id = c.id
        WHERE 
          b.id = ?
        `,
                [id]
            );

            if ((rows as any[]).length === 0) {
                res.status(404).json({ message: 'Book not found' });
                return;
            }

            res.json((rows as any[])[0]);
        } catch (error) {
            console.error('Error getting book:', error);
            res.status(500).json({ message: 'Error retrieving book' });
        }
    }

    async create(req: Request, res: Response): Promise<void> {
        try {
            const {
                title,
                author,
                category_id,
                difficulty,
                status,
                publication_date
            } = req.body as Book;

            if (!title || !author || !category_id || !difficulty || !status) {
                res.status(400).json({ message: 'Missing required fields' });
                return;
            }

            const validDifficulties = ['beginner', 'intermediate', 'advanced'];
            const validStatuses = ['to-read', 'in-progress', 'completed'];

            if (!validDifficulties.includes(difficulty)) {
                res.status(400).json({ message: 'Invalid difficulty level' });
                return;
            }

            if (!validStatuses.includes(status)) {
                res.status(400).json({ message: 'Invalid status' });
                return;
            }

            const result = await pool.query(
                `
        INSERT INTO books (
          title, author, category_id, difficulty, status, publication_date
        ) VALUES (?, ?, ?, ?, ?, ?)
        `,
                [title, author, category_id, difficulty, status, publication_date]
            );

            const id = (result[0] as any).insertId;

            res.status(201).json({
                id,
                title,
                author,
                category_id,
                difficulty,
                status,
                publication_date
            });
        } catch (error) {
            console.error('Error creating book:', error);
            res.status(500).json({ message: 'Error creating book' });
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const {
                title,
                author,
                category_id,
                difficulty,
                status,
                publication_date
            } = req.body as Book;

            if (!title && !author && !category_id && !difficulty && !status && !publication_date) {
                res.status(400).json({ message: 'No fields to update' });
                return;
            }

            const [existingBook] = await pool.query(
                'SELECT * FROM books WHERE id = ?',
                [id]
            );

            if ((existingBook as any[]).length === 0) {
                res.status(404).json({ message: 'Book not found' });
                return;
            }

            if (difficulty) {
                const validDifficulties = ['beginner', 'intermediate', 'advanced'];
                if (!validDifficulties.includes(difficulty)) {
                    res.status(400).json({ message: 'Invalid difficulty level' });
                    return;
                }
            }

            if (status) {
                const validStatuses = ['to-read', 'in-progress', 'completed'];
                if (!validStatuses.includes(status)) {
                    res.status(400).json({ message: 'Invalid status' });
                    return;
                }
            }

            const updates: any[] = [];
            const values: any[] = [];

            if (title) {
                updates.push('title = ?');
                values.push(title);
            }

            if (author) {
                updates.push('author = ?');
                values.push(author);
            }

            if (category_id) {
                updates.push('category_id = ?');
                values.push(category_id);
            }

            if (difficulty) {
                updates.push('difficulty = ?');
                values.push(difficulty);
            }

            if (status) {
                updates.push('status = ?');
                values.push(status);
            }

            if (publication_date) {
                updates.push('publication_date = ?');
                values.push(publication_date);
            }

            updates.push('updated_at = NOW()');

            values.push(id);

            await pool.query(
                `
        UPDATE books 
        SET ${updates.join(', ')} 
        WHERE id = ?
        `,
                values
            );

            const [updatedBook] = await pool.query(
                'SELECT * FROM books WHERE id = ?',
                [id]
            );

            res.json((updatedBook as any[])[0]);
        } catch (error) {
            console.error('Error updating book:', error);
            res.status(500).json({ message: 'Error updating book' });
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const [existingBook] = await pool.query(
                'SELECT * FROM books WHERE id = ?',
                [id]
            );

            if ((existingBook as any[]).length === 0) {
                res.status(404).json({ message: 'Book not found' });
                return;
            }

            await pool.query('DELETE FROM books WHERE id = ?', [id]);

            res.status(204).send();
        } catch (error) {
            console.error('Error deleting book:', error);
            res.status(500).json({ message: 'Error deleting book' });
        }
    }

    async getBorrowers(req: Request, res: Response): Promise<void> {
        try {
            const { bookId } = req.params;

            const [rows] = await pool.query(
                `
        SELECT 
          u.id, 
          u.name, 
          u.email, 
          COUNT(b.id) AS borrow_count,
          MAX(b.borrow_date) AS latest_borrow
        FROM 
          users u
        JOIN 
          borrowings b ON u.id = b.user_id
        WHERE 
          b.book_id = ?
        GROUP BY 
          u.id, u.name, u.email
        ORDER BY 
          latest_borrow DESC
        `,
                [bookId]
            );

            res.json(rows);
        } catch (error) {
            console.error('Error getting book borrowers:', error);
            res.status(500).json({ message: 'Error retrieving book borrowers' });
        }
    }

    async getTopBorrowed(req: Request, res: Response): Promise<void> {
        try {
            const { month } = req.query;

            if (!month || !/^\d{4}-\d{2}$/.test(String(month))) {
                res.status(400).json({ message: 'Invalid month format. Use YYYY-MM' });
                return;
            }

            const [rows] = await pool.query(
                `
        SELECT 
          b.id,
          b.title,
          b.author,
          c.name AS category_name,
          COUNT(br.id) AS borrow_count
        FROM 
          books b
        JOIN 
          borrowings br ON b.id = br.book_id
        JOIN 
          categories c ON b.category_id = c.id
        WHERE 
          DATE_FORMAT(br.borrow_date, '%Y-%m') = ?
        GROUP BY 
          b.id, b.title, b.author, c.name
        ORDER BY 
          borrow_count DESC
        LIMIT 10
        `,
                [month]
            );

            res.json(rows);
        } catch (error) {
            console.error('Error getting top borrowed books:', error);
            res.status(500).json({ message: 'Error retrieving top borrowed books' });
        }
    }
}