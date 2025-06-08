import { Request, Response } from "express";
import { crearUsuario, obtenerMedicos } from "../../service/authUser.service";

export const crearUsuarioNuevo = async (req: Request, res: Response) => {
  try {
    const { authUserId, name, rol, medicoId } = req.body;

    // 1️⃣ Validar campos requeridos
    if (!authUserId || !name || !rol) {
      res.status(400).json({
        message: "Faltan campos requeridos: authUserId, name, rol",
      });
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

    // Manejar error de "Usuario ya existe"
    if (error.message === "El Usuario ya existe con este authUserId") {
      res.status(400).json({
        message: error.message,
      });
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
