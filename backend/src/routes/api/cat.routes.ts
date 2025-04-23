import { Router } from 'express';
import CategoryController from '../../controllers/CategoryController';

const router = Router();

router.get('/', CategoryController.index);
router.post('/', CategoryController.create);
router.get('/:id', CategoryController.show);

export default router;
