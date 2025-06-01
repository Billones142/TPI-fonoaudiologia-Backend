import { Router } from 'express';
import gameRoutes from './routes/gameRoutes';
import userDataRoutes from './routes/userDataRoutes';
import scenesRoutes from './routes/scenesRoutes';

const router = Router();

router.use('/user', userDataRoutes);

// cookie protected routes
router.use('/scenes', scenesRoutes);
router.use('/games', gameRoutes);

export default router;