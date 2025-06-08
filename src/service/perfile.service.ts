import { prisma } from "../config/prismaSingleton";
import { Perfil, Prisma } from "@prisma/client";

// Crear perfil
export const crearPerfil = async (
  usuarioId: string,
  data: Omit<Prisma.PerfilCreateInput, "usuario"> // Excluir la relación usuario
): Promise<Perfil> => {
  return await prisma.perfil.create({
    data: {
      ...data,
      usuario: { connect: { id: usuarioId } },
    },
  });
};

export const editarPerfil = async (
  id: string,
  usuarioId: string,
  data: Prisma.PerfilUpdateInput
): Promise<Perfil> => {
  const perfil = await prisma.perfil.findUnique({
    where: { id },
  });

  if (!perfil || perfil.usuarioId !== usuarioId) {
    throw new Error("No autorizado o perfil no encontrado");
  }

  // Actualizar el perfil
  return await prisma.perfil.update({
    where: { id },
    data,
  });
};

// Eliminar perfil
export const eliminarPerfil = async (
  id: string,
  usuarioId: string
): Promise<void> => {
  const perfil = await prisma.perfil.findUnique({
    where: { id },
  });

  if (!perfil || perfil.usuarioId !== usuarioId) {
    throw new Error("No autorizado o perfil no encontrado");
  }

  await prisma.perfil.delete({
    where: { id },
  });
};
