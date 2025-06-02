import { Router } from "express";
import gameRoutes from "./routes/gameRoutes";
import userDataRoutes from "./routes/userDataRoutes";
import scenesRoutes from "./routes/escenario.route";
import objectsRoutes from "./routes/objetoEscenario.route";

const router = Router();

router.use("/user", userDataRoutes);

// cookie protected routes
router.use("/games", gameRoutes);

router.use("/scenes", scenesRoutes);

router.use("/objects", objectsRoutes);

export default router;
