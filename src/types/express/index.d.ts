// types/express/index.d.ts
import { User } from '../models/User'; // tu tipo o interfaz de usuario

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}
