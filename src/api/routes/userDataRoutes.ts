import { Router, urlencoded } from 'express';
import { loginController } from '../controllers/userDataController';

const router = Router();

router.post('/login', urlencoded({
  extended: true,
  inflate: true,
  limit: '1mb',
  parameterLimit: 2, // user and password
  type: 'application/x-www-form-urlencoded',
}), loginController);

export default router;