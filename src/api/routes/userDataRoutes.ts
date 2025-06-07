import { Router, urlencoded } from 'express';
import { getUserProfilesController, loginController, selectProfileController } from '../controllers/userDataController';
import { userLoggedCheckMiddleware } from '../middlewares/checkLogged';

const router = Router();

router.use(
  urlencoded({
    extended: true,
    inflate: true,
    limit: '1mb',
    parameterLimit: 2, // user and password
    type: 'application/x-www-form-urlencoded',
  }),
);

router.post('/login', loginController);

router.get('/getProfiles', userLoggedCheckMiddleware, getUserProfilesController);

router.post('/selectProfile',
  userLoggedCheckMiddleware,
  selectProfileController,
);

export default router;