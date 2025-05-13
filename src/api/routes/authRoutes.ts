import express from 'express';
import { authController } from '../controllers/autenticationController.js';
import bodyParser from 'body-parser';

const router = express.Router();
router.use(
  bodyParser.urlencoded({ extended: true }),
);

router.post('/login', authController);


export default router;