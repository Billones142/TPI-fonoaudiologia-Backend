import { prisma } from "../config/prismaSingleton";
import { Perfil, Prisma } from "@prisma/client";
import { secretKey } from "../config/env";
import jwt from "jsonwebtoken";
import { Profile } from "../types/models/User";

const cookiesExpireMinutes = 60 * 60;

export const obtenerPerfilesPorUsuario = async (
  authUserId: string
): Promise<Perfil[]> => {
  return await prisma.perfil.findMany({
    where: {
      usuario: {
        authUserId,
      },
    },
  });
};

export const seleccionarPerfil = async (
  authUserId: string,
  profileId: string
): Promise<string | null> => {
  const profileData = await prisma.perfil.findFirst({
    where: {
      id: profileId,
      usuario: {
        authUserId,
      },
    },
  });

  if (!profileData) {
    return null;
  }

  const payload: Profile = {
    id: profileData.id,
    name: profileData.nombre,
  };

  const profileSessionToken = jwt.sign(payload, secretKey, {
    expiresIn: cookiesExpireMinutes, // 1 hour in seconds
  });

  return profileSessionToken;
};

// Crear perfil
export const crearPerfil = async (
  authUserId: string,
  nombre: string,
  avatar_url: string
): Promise<Perfil> => {
  const usuarioId = await prisma.usuario.findUnique({
    where: { authUserId },
    select: { id: true },
  });
  return await prisma.perfil.create({
    data: {
      nombre: nombre,
      avatarUrl: avatar_url,
      usuarioId: usuarioId?.id || "",
    },
  });
};

//if (!perfil || perfil.usuarioId !== usuarioId) {
//throw new Error("No autorizado o perfil no encontrado");
//}
export const editarPerfil = async (
  perfilId: string,
  authUserId: string,
  nombre: string,
  avatar_url: string
): Promise<Perfil> => {
  const usuarioId = await prisma.usuario.findUnique({
    where: { authUserId },
    select: { id: true },
  });
  if (!usuarioId) {
    throw new Error("Usuario no encontrado");
  }

  const perfil = await prisma.perfil.findUnique({
    where: { id: perfilId }, // Asumo que tu campo en la tabla es `id`, no `perfilId`. Si tu campo es `perfilId`, entonces mantenelo.
    select: { id: true, usuarioId: true },
  });

  if (!perfil || perfil.usuarioId !== usuarioId.id) {
    throw new Error("No autorizado o perfil no encontrado");
  }
  return await prisma.perfil.update({
    where: {
      id: perfilId, // suponiendo que perfilId sea el id del perfil que querés editar
    },
    data: {
      nombre: nombre,
      avatarUrl: avatar_url,
    },
  });
};

// Eliminar perfil
export const eliminarPerfil = async (
  perfilId: string,
  authUserId: string
): Promise<void> => {
  const usuarioId = await prisma.usuario.findUnique({
    where: { authUserId },
    select: { id: true },
  });
  if (!usuarioId) {
    throw new Error("Usuario no encontrado");
  }
  await prisma.perfil.delete({
    where: { id: perfilId },
  });
};
