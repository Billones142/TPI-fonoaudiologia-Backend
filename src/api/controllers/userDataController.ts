import jwt from 'jsonwebtoken';
import { Request, Response, RequestHandler } from 'express';
import { secretKey } from '../../config/env';
import { prisma } from '../../lib/prisma';

const cookiesExpireMinutes = 60 * 60;

/**
 * user has to be logged in, so it will return the user profiles that the account has
 * @method GET
 * @param req 
 * @param res 
 */
export const getUserProfilesController: RequestHandler = async (req: Request, res: Response) => {
  const userProfiles = await prisma.perfil.findMany({
    where: {
      usuarioId: req.user?.id,
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
export const selectProfileController: RequestHandler = async (req: Request, res: Response) => {
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
      usuarioId: req.user.id,
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
export const editProfileController: RequestHandler = async (req: Request, res: Response) => { // TODO

};

/**
 * @method POST
 * @param req 
 * @param res 
 */
export const deleteProfileController: RequestHandler = async (req: Request, res: Response) => { // TODO

};