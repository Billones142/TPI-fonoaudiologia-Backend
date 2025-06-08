import { prisma } from "../config/prismaSingleton";
import { Usuario, Prisma } from "@prisma/client";

export const crearUsuario = async (
  data: Prisma.UsuarioCreateInput
): Promise<Usuario> => {
  // 1️⃣ Verificar si ya existe un Usuario con ese authUserId
  const existingUser = await prisma.usuario.findUnique({
    where: { authUserId: data.authUserId },
  });

  if (existingUser) {
    throw new Error("El Usuario ya existe con este authUserId");
  }

  // 2️⃣ Crear el Usuario
  return await prisma.usuario.create({ data });
};

export const obtenerMedicos = async (): Promise<
  { id: string; name: string }[]
> => {
  return await prisma.usuario.findMany({
    where: { rol: "MEDICO" },
    select: {
      id: true,
      name: true,
    },
  });
};
