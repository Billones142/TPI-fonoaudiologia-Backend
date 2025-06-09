import { Response, Request, RequestHandler } from "express";
import {
  crearPerfil,
  editarPerfil,
  eliminarPerfil,
  obtenerPerfilesPorUsuario,
  seleccionarPerfil,
} from "../../service/perfile.service";
const cookiesExpireMinutes = 60 * 60;

export const getUserProfilesController: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const authUserId = req.user?.id;

    if (!authUserId) {
      res.status(403).json({ message: "No autorizado" });
      return;
    }

    const userProfiles = await obtenerPerfilesPorUsuario(authUserId);

    res.json({
      profiles: userProfiles.map((profile) => ({
        id: profile.id,
        name: profile.nombre,
        avatar_url: profile.avatarUrl,
      })),
    });
  } catch (error) {
    console.error("Error al obtener perfiles del usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const selectProfileController: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const authUserId = req.user?.id;

    if (!authUserId) {
      throw new Error("Profile could not be selected, req.user was undefined");
    }

    const { profile_id } = req.body;

    if (typeof profile_id !== "string") {
      throw new Error("No Id was sent");
    }

    const profileSessionToken = await seleccionarPerfil(authUserId, profile_id);

    if (profileSessionToken) {
      const expires = new Date(Date.now() + cookiesExpireMinutes * 1000);

      res.cookie("profilesession", profileSessionToken, {
        secure: Boolean(process.env.SECURE_COOKIES),
        httpOnly: false,
        sameSite: Boolean(process.env.SECURE_COOKIES) ? 'none' : 'lax',
        expires,
      });

      res.json({
        message: "Profile selected successfully",
      });
    } else {
      res.status(404).json({
        message: "User profile not found",
      });
    }
  } catch (error) {
    console.error("Error en selectProfileController:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const crearPerfilNuevo = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authUserId = req.user?.id;
    const nombre = req.body.nombre;
    const avatarUrl = req.body.avatarUrl;

    if (!authUserId) {
      res.status(403).json({ error: "No autorizado" });
      return;
    }

    const perfilCreado = await crearPerfil(authUserId, nombre, avatarUrl);

    res.status(201).json(perfilCreado);
  } catch (error) {
    console.error("Error al crear perfil:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const editarPerfilExistente = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { profileId } = req.params;

  try {
    const usuarioId = req.user?.id;
    const nombre = req.body.nombre;
    const avatarUrl = req.body.avatarUrl;

    if (!usuarioId) {
      res.status(403).json({ error: "No autorizado" });
      return;
    }

    const perfilActualizado = await editarPerfil(
      profileId,
      usuarioId,
      nombre,
      avatarUrl
    );

    res.status(200).json(perfilActualizado);
  } catch (error) {
    console.error("Error al editar el perfil:", error);
    res
      .status(400)
      .json({ message: error instanceof Error ? error.message : "Error" });
  }
};

export const eliminarPerfilExistente = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { profileId } = req.params;

  try {
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      res.status(403).json({ error: "No autorizado" });
      return;
    }

    const perfilActualizado = await eliminarPerfil(profileId, usuarioId);

    res.status(200).json(perfilActualizado);
  } catch (error) {
    console.error("Error al editar el perfil:", error);
    res
      .status(400)
      .json({ message: error instanceof Error ? error.message : "Error" });
  }
};
