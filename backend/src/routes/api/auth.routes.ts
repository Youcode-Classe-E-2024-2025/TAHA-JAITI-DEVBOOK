import { Router } from "express";
import AuthController from "../../controllers/AuthController";
import AuthMiddleware from "../../middlewares/AuthMiddleware";


const router = Router();


router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', AuthMiddleware, AuthController.me);

export default router;