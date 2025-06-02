import { prisma } from "../config/prismaSingleton";

import { Prisma, ObjetoEscenario } from "@prisma/client";

export const crearObjetoEscenario = async (
  data: Prisma.ObjetoEscenarioCreateInput
): Promise<ObjetoEscenario> => {
  return await prisma.objetoEscenario.create({
    data,
  });
};

export const obtenerObjetoEscenarioPorId = async (
  id: string
): Promise<ObjetoEscenario | null> => {
  return await prisma.objetoEscenario.findUnique({
    where: { id },
  });
};
