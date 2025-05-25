import { Router } from "express";
import gameRoutes from "./routes/gameRoutes.js";
import loginRoutes from "./routes/loginRoutes.js";

const router = Router();

router.use(loginRoutes);

// cookie protected routes
router.use('/games'/** middleware */, gameRoutes);

export default router;