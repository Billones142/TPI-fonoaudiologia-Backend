import { Router } from "express";
import {
  obtenerEscenario,
  crearEscenarioNuevo,
  obtenerEscenariosAll,
} from "../controllers/escenario.controller";

const router = Router();

router.get("/:id", obtenerEscenario);

router.get("/", obtenerEscenariosAll);

router.post("/", crearEscenarioNuevo);

export default router;
