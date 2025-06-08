import { Router } from "express";
import {
  crearUsuarioNuevo,
  obtenerMedicosController,
} from "../controllers/authUser.controller";

const router = Router();

// Ruta POST /api/usuarios
router.post("/", crearUsuarioNuevo);

router.get("/medicos", obtenerMedicosController);

export default router;
