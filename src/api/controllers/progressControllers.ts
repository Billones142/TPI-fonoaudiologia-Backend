import { Request, RequestHandler, Response } from 'express';

import { prisma } from '../../lib/prisma';
import { GetProgressedScenesResponse } from '../../types/api/APIResponses';

/**
 * @method GET
 * @param req 
 * @param res 
 */
export const getProgressedScenes: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  let respuesta: GetProgressedScenesResponse;
  if (!req.profile) {
    respuesta = {
      status: 'error',
      error: ['No se inicio sesion en el perfil'],
    };
    res.status(401);
  } else {
    const escenenarios = await prisma.escenario.findMany({ // TODO: mover a servicio
      where: {
        progresosEscenarios: {
          some: {
            perfilId: req.profile?.id,
          },
        },
      },
    });
    respuesta = {
      status: 'ok',
      scenesWithProgress: escenenarios,
    };
  }

  res.json(respuesta);
};

/**
 * @method GET
 * @param req 
 * @param res 
 */
export const getSceneProgressController: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const sceneId = req.params;

  const sessionesJuegoDeEscenario = await prisma.sesionJuego.findMany({ //TODO: mover a servicio
    where: {
      escenarioId: sceneId,
    },
  });

  res.json({
    sessionesDeEscenario: sessionesJuegoDeEscenario,
  });
};
