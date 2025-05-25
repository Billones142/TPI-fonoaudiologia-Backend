import jwt from "jsonwebtoken";
import { Handler, Request, Response } from "express";
import { secretKey } from "../../config/env";
import { verifyUser } from "../../service/database";



/**
 * takes a post an then
 * @param req 
 * @param res 
 */
export const authController: Handler = async (req: Request, res: Response) => { // TODO: agregar rol del usuario al payload del JWT
  const { user, password } = req.body;

  if (typeof user !== 'string' || typeof password !== 'string') {
    console.error('Invalid credentials:', user, password);
    res.status(401).json({ message: 'not valid username or password' });
    return;
  }

  const verified = await verifyUser(user, password);

  if (!verified) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  const expires = new Date(Date.now() + (60 * 60 * 1000)); // 60 minutos
  const generatedToken = jwt.sign({ user: user, expires: expires }, secretKey);
  res.cookie('sessionid', generatedToken, { secure: true, httpOnly: true, expires: expires });
  res.status(200).json({ message: 'Login successful' });
}