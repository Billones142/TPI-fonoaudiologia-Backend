import { Router } from "express";
import {
  obtenerObjetoEscenario,
  crearObjetoEscenarios,
} from "../controllers/objetoEscenario.controller";

const router = Router();

router.get("/:id", obtenerObjetoEscenario);

router.post("/", crearObjetoEscenarios);

export default router;
