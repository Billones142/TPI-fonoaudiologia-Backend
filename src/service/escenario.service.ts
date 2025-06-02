import { prisma } from "../config/prismaSingleton";
import { Escenario, Prisma } from "@prisma/client";

export const crearEscenario = async (
  data: Prisma.EscenarioCreateInput
): Promise<Escenario> => {
  return await prisma.escenario.create({
    data,
  });
};

export const obtenerEscenarioPorId = async (
  id: string
): Promise<Escenario | null> => {
  return await prisma.escenario.findUnique({
    where: { id },
    include: {
      objetos: true,
    },
  });
};

export const obtenerEscenarios = async (): Promise<Escenario[]> => {
  return await prisma.escenario.findMany({
    include: {
      objetos: true,
    },
  });
};
