import { Router } from 'express';
import bookRoutes from './api/book.routes';
import authRoutes from './api/auth.routes';
import catRoutes from './api/cat.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/books', bookRoutes);
router.use('/categories', catRoutes);


export default router;