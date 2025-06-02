import { Response, Request } from "express";
import {
  obtenerEscenarioPorId,
  crearEscenario,
  obtenerEscenarios,
} from "../../service/escenario.service";
import { Prisma } from "@prisma/client";

export const crearEscenarioNuevo = async (
  req: Request<Record<string, never>, unknown, Prisma.EscenarioCreateInput>,
  res: Response
): Promise<void> => {
  try {
    const data = req.body; // ya tipado como EscenarioCreateInput

    const escenarioCreado = await crearEscenario(data);

    res.status(201).json(escenarioCreado);
  } catch (error) {
    console.error("Error al crear escenario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const obtenerEscenario = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    if (!id) {
      res.status(400).json({ error: "ID no proporcionado" });
      return;
    }

    const escenario = await obtenerEscenarioPorId(id);

    if (!escenario) {
      res.status(404).json({ message: "Escenario no encontrado" });
      return;
    }

    res.status(200).json(escenario);
  } catch (error) {
    console.error("Error al obtener el escenario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const obtenerEscenariosAll = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const escenarios = await obtenerEscenarios();
    res.status(200).json(escenarios);
  } catch (error) {
    console.error("Error al obtener los escenarios:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
