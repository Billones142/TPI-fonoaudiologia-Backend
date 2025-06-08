import { json, Router, urlencoded } from 'express';
import { getUserProfilesController, selectProfileController } from '../controllers/userDataController';
import { userLoggedCheckMiddleware } from '../middlewares/checkLogged';

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

export default router;