import jwt from 'jsonwebtoken';
import { Handler, Request, Response } from 'express';
import { secretKey } from '../../config/env';
import { User } from '../../types/models/User';
import { prisma } from '../../lib/prisma';
import { verifyUser } from '../../service/userServices';
import { userLoggedCheckMiddleware } from '../middlewares/checkLogged';

const cookiesExpireMinutes = 60 * 60;


/**
 * Recieves a username and password as a URL encoded form an returns a session cookie if they are valid
 * @method POST
 * @param req 
 * @param res 
 */
export const loginController: Handler = async (req: Request, res: Response) => {
  // TODO: agregar rol del usuario al payload del JWT, agregar conexion a base de datos
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { email, password } = req.body;

  if (typeof email !== 'string' || typeof password !== 'string') {
    console.error('Invalid credentials:', email, password);
    res.status(401)
      .json({ message: 'not valid username or password' });
    return;
  }

  const verified = await verifyUser(email, password);

  if (!verified) {
    res.status(401)
      .json({ message: 'Invalid credentials' });
    return;
  }


  const expires = new Date(Date.now() + (cookiesExpireMinutes * 1000)); // 60 minutos
  const payloadData: User = {
    username: verified.name,
    userId: verified.id,
  };
  const generatedToken = jwt.sign(payloadData, secretKey, { expiresIn: cookiesExpireMinutes });

  res.cookie('sessionid', generatedToken, { secure: false, httpOnly: true, expires: expires });
  res.status(200).json({ message: 'Login successful' });
};

/**
 * user has to be logged in, so it will return the user profiles that the account has
 * @method GET
 * @param req 
 * @param res 
 */
export const getUserProfilesController: Handler = async (req: Request, res: Response) => { //TODO: completar con logica de la base de datos
  const userProfiles = await prisma.perfil.findMany({
    where: {
      usuarioId: req.user?.userId,
    },
  });
  res.json({
    profiles: [
      ...userProfiles.map(profile => {
        return {
          id: profile.id,
          name: profile.nombre,
          avatar_url: profile.avatarUrl,
        };
      }),
    ],
  });
};

/**
 * returns a cookie with the profile selected
 * @method POST 
 * @param req should include the id of the profile as urlencode form
 * @param res 
 */
export const selectProfileController: Handler = async (req: Request, res: Response) => { //TODO
  // JWT should include username and profile name, JWT should expire in 2hs?
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { profile_id } = req.body;

  if (!req.user) {
    throw new Error('Profile could not be selected, req.user was undefined');
  }

  if (typeof profile_id !== 'string') {
    throw new Error('No Id was send');
  }

  const profileData = await prisma.perfil.findFirst({
    where: {
      id: profile_id,
      usuarioId: req.user.userId,
    },
  });

  if (profileData) {
    const expires = new Date(Date.now() + (cookiesExpireMinutes * 1000));
    const profileSessionToken = jwt.sign(
      {
        profile_name: profileData.nombre,
        profile_id: profileData.id,
      }, secretKey,
      {
        expiresIn: cookiesExpireMinutes, // 1 hour in seconds
      });
    res.cookie('profilesession', profileSessionToken, { secure: false, httpOnly: true, expires: expires });
    res.json({
      message: 'Profile selected succesfully',
    });
  } else {
    res.status(404).json({
      message: 'User profile not found',
    });
  }
};

/**
 * @method POST
 * @param req 
 * @param res 
 */
export const editProfileController: Handler = async (req: Request, res: Response) => { // TODO

};

/**
 * @method POST
 * @param req 
 * @param res 
 */
export const deleteProfileController: Handler = async (req: Request, res: Response) => { // TODO

};