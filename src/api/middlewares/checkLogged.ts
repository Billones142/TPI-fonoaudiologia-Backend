import express, { Request, Response, NextFunction, Handler } from 'express';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { secretKey } from '../../config/env';
import { User } from '../../types/models/User';

const router = express.Router();
router.use(cookieParser());

//export interface AuthenticatedRequest extends Request {
//  user?: {
//    username: string,
//  },
//}

/**
 * requires to have the bodyparser with urlencoded to work
 * @description checks that the user is logged in and adds the data from this user to the request
 * @param req 
 * @param res 
 * @param next 
 */
export const userLoggedCheckMiddleware: Handler = async (req: Request, res: Response, next: NextFunction): Promise<void> => { // TODO: agregar logica de base de datos
  const { sessionid } = req.cookies;

  if (typeof sessionid !== 'string') {
    res.status(403).json({
      message: 'No session token',
    });
  } else {
    const payload = jwt.verify(sessionid, secretKey) as User;
    req.user = payload;
    next();
    // TODO: add user data to the req
  }
};

