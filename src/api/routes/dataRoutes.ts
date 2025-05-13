import express, { Request, Response, NextFunction, Handler } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dataController from '../controllers/dataController.js';
import { userLoggedCheckMiddleware } from '../middlewares/logged.js';

const router = express.Router();

router.use(
  cookieParser(),
);

router.get('/data', userLoggedCheckMiddleware, dataController);

export default router;