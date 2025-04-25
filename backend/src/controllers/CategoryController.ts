import type { Request, Response } from 'express';
import pool from '../utils/db';
import type { Category } from '../models/Category';

export class CategoryController {
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const [rows] = await pool.query(
                `
        SELECT 
          c.id,
          c.name,
          c.description,
          COUNT(b.id) AS book_count
        FROM 
          categories c
        LEFT JOIN 
          books b ON c.id = b.category_id
        GROUP BY 
          c.id, c.name, c.description
        ORDER BY 
          c.name
        `
            );

            res.json(rows);
        } catch (error) {
            console.error('Error getting categories:', error);
            res.status(500).json({ message: 'Error retrieving categories' });
        }
    }

    async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const [rows] = await pool.query(
                `
        SELECT 
          c.*,
          COUNT(b.id) AS book_count
        FROM 
          categories c
        LEFT JOIN 
          books b ON c.id = b.category_id
        WHERE 
          c.id = ?
        GROUP BY 
          c.id
        `,
                [id]
            );

            if ((rows as any[]).length === 0) {
                res.status(404).json({ message: 'Category not found' });
                return;
            }

            res.json((rows as any[])[0]);
        } catch (error) {
            console.error('Error getting category:', error);
            res.status(500).json({ message: 'Error retrieving category' });
        }
    }

    async create(req: Request, res: Response): Promise<void> {
        try {
            const { name, description } = req.body as Category;

            if (!name) {
                res.status(400).json({ message: 'Category name is required' });
                return;
            }

            const result = await pool.query(
                'INSERT INTO categories (name, description) VALUES (?, ?)',
                [name, description || '']
            );

            const id = (result[0] as any).insertId;

            res.status(201).json({
                id,
                name,
                description
            });
        } catch (error) {
            console.error('Error creating category:', error);
            res.status(500).json({ message: 'Error creating category' });
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { name, description } = req.body as Category;

            if (!name && !description) {
                res.status(400).json({ message: 'No fields to update' });
                return;
            }

            const [existingCategory] = await pool.query(
                'SELECT * FROM categories WHERE id = ?',
                [id]
            );

            if ((existingCategory as any[]).length === 0) {
                res.status(404).json({ message: 'Category not found' });
                return;
            }

            const updates: any[] = [];
            const values: any[] = [];

            if (name) {
                updates.push('name = ?');
                values.push(name);
            }

            if (description !== undefined) {
                updates.push('description = ?');
                values.push(description);
            }

            values.push(id);

            await pool.query(
                `
        UPDATE categories 
        SET ${updates.join(', ')} 
        WHERE id = ?
        `,
                values
            );

            const [updatedCategory] = await pool.query(
                'SELECT * FROM categories WHERE id = ?',
                [id]
            );

            res.json((updatedCategory as any[])[0]);
        } catch (error) {
            console.error('Error updating category:', error);
            res.status(500).json({ message: 'Error updating category' });
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const [existingCategory] = await pool.query(
                'SELECT * FROM categories WHERE id = ?',
                [id]
            );

            if ((existingCategory as any[]).length === 0) {
                res.status(404).json({ message: 'Category not found' });
                return;
            }

            const [bookCount] = await pool.query(
                'SELECT COUNT(*) as count FROM books WHERE category_id = ?',
                [id]
            );

            if ((bookCount as any[])[0].count > 0) {
                res.status(400).json({
                    message: 'Cannot delete category with books. Remove or reassign books first.'
                });
                return;
            }

            await pool.query('DELETE FROM categories WHERE id = ?', [id]);

            res.status(204).send();
        } catch (error) {
            console.error('Error deleting category:', error);
            res.status(500).json({ message: 'Error deleting category' });
        }
    }

    async getMostBorrowed(req: Request, res: Response): Promise<void> {
        try {
            const [rows] = await pool.query(
                `
        SELECT 
          c.id,
          c.name,
          c.description,
          COUNT(br.id) AS borrow_count
        FROM 
          categories c
        JOIN 
          books b ON c.id = b.category_id
        JOIN 
          borrowings br ON b.id = br.book_id
        GROUP BY 
          c.id, c.name, c.description
        ORDER BY 
          borrow_count DESC
        LIMIT 1
        `
            );

            if ((rows as any[]).length === 0) {
                res.status(404).json({ message: 'No borrowing data found' });
                return;
            }

            res.json((rows as any[])[0]);
        } catch (error) {
            console.error('Error getting most borrowed category:', error);
            res.status(500).json({ message: 'Error retrieving most borrowed category' });
        }
    }
}