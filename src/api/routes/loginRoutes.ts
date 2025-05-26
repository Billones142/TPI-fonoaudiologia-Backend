import { Router } from 'express';
import { authController } from '../controllers/loginController';

const router = Router();

router.post('/login', authController);
export default router;