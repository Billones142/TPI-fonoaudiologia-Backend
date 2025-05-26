import { Router } from 'express';
import gameRoutes from './routes/gameRoutes';
import loginRoutes from './routes/loginRoutes';

const router = Router();

router.use(loginRoutes);

// cookie protected routes
router.use('/games'/** middleware */, gameRoutes);

export default router;