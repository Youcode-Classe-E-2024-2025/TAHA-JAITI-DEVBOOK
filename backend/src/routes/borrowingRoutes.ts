import express from 'express';
import { CategoryController } from '../controllers/CategoryController';
import { authMiddleware } from '../middlewares/auth';

const router = express.Router();
const categoryController = new CategoryController();

// Public routes
router.get('/', categoryController.getAll.bind(categoryController));
router.get('/most-borrowed', categoryController.getMostBorrowed.bind(categoryController));
router.get('/:id', categoryController.getById.bind(categoryController));

// Protected routes
router.post('/', authMiddleware, categoryController.create.bind(categoryController));
router.put('/:id', authMiddleware, categoryController.update.bind(categoryController));
router.delete('/:id', authMiddleware, categoryController.delete.bind(categoryController));

export default router;