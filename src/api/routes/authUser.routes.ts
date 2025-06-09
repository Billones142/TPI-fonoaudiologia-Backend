import { Router } from "express";
import {
  crearUsuarioNuevo,
  obtenerMedicosController,
  obtenerUsuarioController,
} from "../controllers/authUser.controller";
import { userLoggedCheckMiddleware } from "../middlewares/checkLogged";

const router = Router();

// Ruta POST /api/usuarios
router.get("/medicos", obtenerMedicosController);

router.post("/", userLoggedCheckMiddleware, crearUsuarioNuevo);

router.get("/:authUserId", userLoggedCheckMiddleware, obtenerUsuarioController);

export default router;
