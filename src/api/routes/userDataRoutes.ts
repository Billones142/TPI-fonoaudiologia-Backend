import { json, Router } from 'express';
import { getUserProfilesController, selectProfileController } from '../controllers/userDataController';
import { userLoggedCheckMiddleware } from '../middlewares/checkLogged';
import progressRoutes from './progressRoutes';

const router = Router();

// Middleware para parsear JSON debe ir antes de las rutas
router.use(json());

router.get('/getProfiles',
  userLoggedCheckMiddleware,
  getUserProfilesController,
);

router.post('/selectProfile',
  userLoggedCheckMiddleware,
  selectProfileController,
);

router.use('/progress', progressRoutes);

export default router;