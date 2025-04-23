import { Router } from 'express';
import BookController from '../../controllers/BookController';

const router = Router();

router.get('/', BookController.index);
// router.post('/', BookController.store);
// router.get('/:id', BookController.show);
// router.put('/:id', BookController.update);
// router.delete('/:id', BookController.destroy);

export default router;
