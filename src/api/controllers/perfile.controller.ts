import { Response, Request } from "express";
import {
  crearPerfil,
  editarPerfil,
  eliminarPerfil,
} from "../../service/perfile.service";
import { Prisma } from "@prisma/client";

// POST /perfiles
export const crearPerfilNuevo = async (
  req: Request<
    Record<string, never>,
    unknown,
    Omit<Prisma.PerfilCreateInput, "usuario">
  >,
  res: Response
): Promise<void> => {
  try {
    const data = req.body; // los datos del perfil (sin usuario)

    // 🚀 usuarioId del token
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      res.status(403).json({ error: "No autorizado" });
      return;
    }

    const perfilCreado = await crearPerfil(usuarioId, data);

    res.status(201).json(perfilCreado);
  } catch (error) {
    console.error("Error al crear perfil:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// PUT /perfiles/:id
export const editarPerfilExistente = async (
  req: Request<{ id: string }, unknown, Prisma.PerfilUpdateInput>,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const data = req.body;

  try {
    // 🚀 usuarioId del token
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      res.status(403).json({ error: "No autorizado" });
      return;
    }

    const perfilActualizado = await editarPerfil(id, usuarioId, data);

    res.status(200).json(perfilActualizado);
  } catch (error) {
    console.error("Error al editar el perfil:", error);
    res
      .status(400)
      .json({ message: error instanceof Error ? error.message : "Error" });
  }
};

// DELETE /perfiles/:id
export const eliminarPerfilExistente = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    // 🚀 usuarioId del token
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      res.status(403).json({ error: "No autorizado" });
      return;
    }

    await eliminarPerfil(id, usuarioId);

    res.status(200).json({ message: "Perfil eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el perfil:", error);
    res
      .status(400)
      .json({ message: error instanceof Error ? error.message : "Error" });
  }
};
