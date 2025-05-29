import jwt from 'jsonwebtoken';
import { Handler, Request, Response } from 'express';
import { secretKey } from '../../config/env';
import { verifyUser } from '../../service/database';

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
  const { user, password } = req.body;

  if (typeof user !== 'string' || typeof password !== 'string') {
    console.error('Invalid credentials:', user, password);
    res.status(401)
      .json({ message: 'not valid username or password' });
    return;
  }

  const verified = await verifyUser(user, password);

  if (!verified) {
    res.status(401)
      .json({ message: 'Invalid credentials' });
    return;
  }

  const expires = new Date(Date.now() + (cookiesExpireMinutes * 1000)); // 60 minutos
  const generatedToken = jwt.sign({ user: user }, secretKey, { expiresIn: cookiesExpireMinutes });
  res.cookie('sessionid', generatedToken, { secure: false, httpOnly: true, expires: expires });
  res.status(200).json({ message: 'Login successful' });
};

/**
 * GET. Sends a response with all the profiles related to the session cookie account
 * @method GET
 * @param req
 * @param res 
 */
export const getUserProfilesController: Handler = async (req: Request, res: Response) => { // TODO

};

/**
 * user has to be logged in, so it will return the user profiles that the account has
 * @method GET
 * @param req 
 * @param res 
 */
export const getUserProfiles: Handler = async (req: Request, res: Response) => { //TODO: completar con logica de la base de datos
  res.json({
    profiles: [
      {
        name: 'juan',
        id: '42',
      },
    ],
  });
};

/**
 * returns a cookie with the profile selected
 * @method POST 
 * @param req should include the id of the profile as urlencode form
 * @param res 
 */
export const selectProfileCotroller: Handler = async (req: Request, res: Response) => { //TODO
  // JWT should include username and profile name, JWT should expire in 2hs?
  const { profile_id } = req.query;

  if (!req.user) {
    throw new Error('Profile could not be selected, req.user was undefined');
  }

  const profileExists = profile_id === '42'; // TODO: agregar logica de la base de datos
  const profileData = {
    username: 'juan',
    id: '42',
  };

  if (profileExists) {
    const expires = new Date(Date.now() + (cookiesExpireMinutes * 1000));
    const profileSessionToken = jwt.sign(
      {
        profile_name: profileData.username,
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