import { Router } from 'express';
import BookController from '../../controllers/BookController';

const router = Router();

router.get('/', BookController.index);
router.post('/', BookController.store);
router.get('/:id', BookController.show);
router.delete('/:id', BookController.delete);

export default router;
