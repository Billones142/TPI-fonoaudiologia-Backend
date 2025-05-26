import express, { Request, Response, NextFunction, Handler } from 'express';
import jwt from "jsonwebtoken";
import cookieParser from 'cookie-parser';
import { secretKey } from "../../config/env.js";

const router = express.Router();
router.use(cookieParser());

export interface AuthenticatedRequest extends Request {
  user?: {
    username: string,
  },
}

/**
 * requires to have the bodyparser with urlencoded
 * @param req 
 * @param res 
 * @param next 
 */
export const userLoggedCheckMiddleware: Handler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const { sessionid } = req.cookies;

  if (typeof sessionid !== 'string') {
    res.status(403).json({
      message: 'No session token',
    });
  } else {
    try {
      const payload = jwt.verify(sessionid, secretKey) as { user: string };
      req.user = { username: payload.user };
      next();
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
      }
    }
  }
};