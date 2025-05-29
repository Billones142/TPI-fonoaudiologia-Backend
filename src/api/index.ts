import { Router } from 'express';
import gameRoutes from './routes/gameRoutes';
import userDataRoutes from './routes/userDataRoutes';

const router = Router();

router.use('/user', userDataRoutes);

// cookie protected routes
router.use('/games', gameRoutes);

export default router;