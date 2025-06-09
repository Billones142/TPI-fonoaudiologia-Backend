import { json, Router } from "express";
import {
  crearPerfilNuevo,
  editarPerfilExistente,
  eliminarPerfilExistente,
  getUserProfilesController,
  selectProfileController,
} from "../controllers/perfile.controller";
import { userLoggedCheckMiddleware } from "../middlewares/checkLogged";
import progressRoutes from "./progressRoutes";

const router = Router();

// Middleware para parsear JSON debe ir antes de las rutas
router.use(json());

router.get("/", userLoggedCheckMiddleware, getUserProfilesController);

router.post(
  "/selectProfile",
  userLoggedCheckMiddleware,
  selectProfileController
);

router.post("/", userLoggedCheckMiddleware, crearPerfilNuevo);

router.put(
  "/editProfile/:profileId",
  userLoggedCheckMiddleware,
  editarPerfilExistente
);

router.delete(
  "/deleteProfile/:profileId",
  userLoggedCheckMiddleware,
  eliminarPerfilExistente
);

router.use("/progress", progressRoutes);

export default router;
