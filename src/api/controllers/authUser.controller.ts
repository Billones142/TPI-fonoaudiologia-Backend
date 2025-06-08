import { Request, Response } from "express";
import {
  crearUsuario,
  obtenerMedicos,
  obtenerUsuarioPorAuthUserId,
} from "../../service/authUser.service";

export const crearUsuarioNuevo = async (req: Request, res: Response) => {
  try {
    const authUserId = req.user.id;
    const { name, rol, medicoId } = req.body;

    // 1️⃣ Validar campos requeridos
    if (!name || !rol) {
      res.status(400).json({
        message: "Faltan campos requeridos: name, rol",
      });
      return; // importante agregar return
    }

    // 2️⃣ Armar el input para el service
    const usuarioData = {
      authUserId,
      name,
      rol,
      medicoId: rol === "PACIENTE" ? medicoId ?? undefined : undefined,
    };

    // 3️⃣ Llamar al service
    const nuevoUsuario = await crearUsuario(usuarioData);

    // 4️⃣ Responder con el nuevo Usuario
    res.status(201).json(nuevoUsuario);
  } catch (error: any) {
    console.error("Error en crearUsuarioController:", error);

    if (error.message === "El Usuario ya existe con este authUserId") {
      res.status(400).json({
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      message: "Error interno al crear el Usuario",
    });
  }
};

export const obtenerMedicosController = async (req: Request, res: Response) => {
  try {
    const medicos = await obtenerMedicos();
    res.status(200).json(medicos);
  } catch (error) {
    console.error("Error al obtener médicos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const obtenerUsuarioController = async (req: Request, res: Response) => {
  const { authUserId } = req.params;
  try {
    if (!authUserId) {
      res.status(400).json({ message: "authUserId no proporcionado" });
    }

    const usuario = await obtenerUsuarioPorAuthUserId(authUserId);

    if (!usuario) {
      res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json(usuario);
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
