import { Request, Response, NextFunction, Handler } from "express";
import {
  secretKey,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
} from "../../config/env";
import { Profile, User } from "../../types/models/User";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

/**
 * 
 * @description checks that the user is logged in and adds the data from this user to the request
 * @param req
 * @param res
 * @param next
 */
export const userLoggedCheckMiddleware: Handler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { authorization, profilesession } = req.headers;
  try {
    console.log('cookies de usuario:', JSON.stringify(req.cookies));
  } catch (error) { }

  if (!authorization || !authorization.startsWith("Bearer ")) {
    res.status(403).json({
      message: "No authorization token provided",
    });
    return;
  }

  const token = authorization.split(" ")[1];

  try {
    if (typeof profilesession === "string") {
      try {
        const data = jwt.verify(profilesession.split(' ')[1], secretKey) as Profile;
        req.profile = data;
        console.log('datos de perfil', data);
      } catch (error) {
        throw new Error("Profile token was invalid");
      }
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Error de verificacion de usuario', user, error);
      res.status(403).json({
        message: "Invalid or expired token",
      });
      return;
    }

    // Convert Supabase user to our User type
    const appUser: User = {
      id: user.id,
      email: user.email || "",
      name: (user.user_metadata?.username as string) || "",
    };

    req.user = appUser;
    next();
  } catch (error) {
    res.status(403).json({
      message: "Invalid or expired token: " + (error as Error).message,
    });
  }
};
