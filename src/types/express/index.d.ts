// types/express/index.d.ts
import { Profile, User } from '../models/User'; // tu tipo o interfaz de usuario

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
    profile?: Profile,
  }
}
