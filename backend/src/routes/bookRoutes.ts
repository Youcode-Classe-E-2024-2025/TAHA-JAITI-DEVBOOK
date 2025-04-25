import express from 'express';
import { BookController } from '../controllers/BookController';
import { authMiddleware } from '../middlewares/auth';

const router = express.Router();
const bookController = new BookController();

// Public routes
router.get('/', bookController.getAll.bind(bookController));
router.get('/top-borrowed', bookController.getTopBorrowed.bind(bookController));
router.get('/:id', bookController.getById.bind(bookController));
router.get('/:bookId/borrowers', bookController.getBorrowers.bind(bookController));

// Protected routes
router.post('/', authMiddleware, bookController.create.bind(bookController));
router.put('/:id', authMiddleware, bookController.update.bind(bookController));
router.delete('/:id', authMiddleware, bookController.delete.bind(bookController));

export default router;