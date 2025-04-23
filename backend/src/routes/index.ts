import {Router} from 'express';
import bookRoutes from './api/book.routes';

const router = Router();

router.use('/books', bookRoutes);


export default router;