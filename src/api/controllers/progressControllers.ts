import { RequestHandler, Request, Response } from 'express';

import { prisma } from '../../lib/prisma';
import { GetProgressedScenesResponse, GetSceneProgressResponse } from '../../types/api/APIResponses';
import { getScenesWithProfileProgress } from '../../service/progressServices';

/**
 * @method GET
 * @param req 
 * @param res 
 */
export const getProgressedScenesController: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  let response: GetProgressedScenesResponse;
  if (!req.profile) {
    response = {
      status: 'error',
      error: ['No se selecciono un perfil'],
    };
    res.status(401);
  } else {
    const escenenarios = await getScenesWithProfileProgress(req.profile.id);
    response = {
      status: 'ok',
      scenes_with_progress: escenenarios,
    };
  }

  res.json(response);
};

/**
 * @method GET
 * @param req 
 * @param res 
 */
export const getSceneProgressController: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { sceneId } = req.params;
  let response: GetSceneProgressResponse;

  // Validate profile first
  if (!req.profile) {
    response = {
      status: 'error',
      error: ['No se selecciono un perfil'],
    };
    res.status(401);
    res.json(response);
    return;
  }

  // Then validate sceneId
  if (!sceneId) {
    response = {
      status: 'error',
      error: ['ID de escena no proporcionado'],
    };
    res.status(400);
    res.json(response);
    return;
  }

  try {
    // Get game sessions for the scene
    const sessionesJuegoDeEscenario = await prisma.sesionJuego.findMany({
      where: {
        escenarioId: sceneId,
        perfilId: req.profile.id,
      },
      include: {
        juegos: {
          orderBy: {
            updatedAt: 'desc',
          },
        },
      },
    });

    // Validate if sessions exist
    if (!sessionesJuegoDeEscenario || sessionesJuegoDeEscenario.length === 0) {
      response = {
        status: 'ok',
        scenes_game_sessions: [],
      };
      res.json(response);
      return;
    }

    // Transform sessions to GameSession type
    const gameSessions = sessionesJuegoDeEscenario.map((sesion, index) => {
      const ultimaRespuesta = sesion.juegos[0]; // Already ordered by desc
      const tiempoCompletadoSegundos = ultimaRespuesta
        ? Math.floor((ultimaRespuesta.updatedAt.getTime() - sesion.createdAt.getTime()) / 1000)
        : 0;

      return {
        intento: index + 1,
        aciertos: sesion.aciertos,
        totalPreguntas: sesion.juegosTotales,
        tiempoCompletado: tiempoCompletadoSegundos,
      };
    });

    response = {
      status: 'ok',
      scenes_game_sessions: gameSessions,
    };
  } catch (error) {
    console.error('Error al obtener el progreso de la escena:', error);
    response = {
      status: 'error',
      error: ['Error al obtener el progreso de la escena'],
    };
    res.status(500);
  }

  res.json(response);
};
