import {Router} from 'express';
import bookRoutes from './api/book.routes';
import authRoutes from './api/auth.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/books', bookRoutes);


export default router;