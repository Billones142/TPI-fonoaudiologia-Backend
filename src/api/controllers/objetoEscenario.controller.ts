import { Request, Response } from "express";
import {
  obtenerObjetoEscenarioPorId,
  crearObjetoEscenario,
} from "../../service/objetoEscenario.service";
import { Prisma } from "@prisma/client";

export const crearObjetoEscenarios = async (
  req: Request<
    Record<string, never>,
    unknown,
    Prisma.ObjetoEscenarioCreateInput
  >,
  res: Response
): Promise<void> => {
  try {
    const data = req.body; // ya tipado como ObjetoEscenarioCreateInput

    const objetoEscenarioCreado = await crearObjetoEscenario(data);

    res.status(201).json(objetoEscenarioCreado);
  } catch (error) {
    console.error("Error al crear objeto de escenario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const obtenerObjetoEscenario = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    if (!id) {
      res.status(400).json({ error: "ID no proporcionado" });
      return;
    }

    const objetoEscenario = await obtenerObjetoEscenarioPorId(id);

    if (!objetoEscenario) {
      res.status(404).json({ message: "Objeto de escenario no encontrado" });
      return;
    }

    res.status(200).json(objetoEscenario);
    return;
  } catch (error) {
    console.error("Error al obtener el objeto de escenario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
    return;
  }
};
