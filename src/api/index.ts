import { Router } from "express";
import gameRoutes from "./routes/gameRoutes";
import userDataRoutes from "./routes/userDataRoutes";
import scenesRoutes from "./routes/escenario.route";
import objectsRoutes from "./routes/objetoEscenario.route";
import authUserRoutes from "./routes/authUser.routes";
import perfilesRoutes from "./routes/perfiles.routes";
import { userLoggedCheckMiddleware } from "./middlewares/checkLogged";

const router = Router();

router.use("/user", userDataRoutes);

router.use("/auth", authUserRoutes);

router.use("/perfiles", perfilesRoutes);

// cookie protected routes
router.use("/games", userLoggedCheckMiddleware, gameRoutes);

router.use("/scenes", scenesRoutes);

router.use("/objects", objectsRoutes);

export default router;
