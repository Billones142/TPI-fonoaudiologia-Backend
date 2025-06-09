import { Handler, Request, Response } from 'express';

import { prisma } from '../../lib/prisma';
import { CheckGameResult, GetGamesResponse } from '../../types/api/APIResponses';
import { desencriptarSelectorObjeto, generarJuegosAleatorios, procesarRespuestaEnBaseDeDatos } from '../../service/gamesServices';


/**
 * @method GET
 * @param req 
 * @param res 
 */
export const getGames: Handler = async (req: Request, res: Response) => {
  const { sceneId } = req.params;
  let apiResponse: GetGamesResponse;

  try {
    if (!req.profile) {
      throw new Error('User profile not selected');
    }
    const juegos = await generarJuegosAleatorios(sceneId, 2, req.profile.id);

    apiResponse = {
      status: 'ok',
      games_data: juegos,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error(`escena con id ${sceneId} no encontrado`, error);
      apiResponse = {
        status: 'error',
        error: ['game not found', error.message],
      };
      res.status(404);
    } else {
      apiResponse = {
        status: 'error',
        error: [String(error)],
      };
      res.status(500);
    }
  }

  res.json(apiResponse);
};

/**
 * recibe como parametro "selectionId" con el cual responde si la respuesta fue correcta y tambien guarda el resultado en la base de datos
 * @method POST
 * @param req 
 * @param res 
 */
export const checkGameResult: Handler = async (req: Request, res: Response): Promise<void> => { // TODO: agregar conexion a la base de datos
  const { selectionId } = req.params;

  if (typeof selectionId !== 'string') {
    throw new Error('Selection id is not a string');
  }

  let apiResponse: CheckGameResult;

  try {
    const decryptedPayload = await procesarRespuestaEnBaseDeDatos(selectionId);

    apiResponse = {
      status: 'ok',
      game_session_id: decryptedPayload.sessionId,
      is_correct: decryptedPayload.isGameResult,
      object_id: decryptedPayload.objectId,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'JsonWebTokenError' && error.message === 'invalid signature') {
        apiResponse = {
          status: 'error',
          error: ['The token was not valid'],
        };
        res.status(406); // code 406: not acceptable
      } else {
        apiResponse = {
          status: 'error',
          error: [error.message],
        };
        res.status(406);
      }
    } else {
      apiResponse = {
        status: 'error',
        error: [String(error)],
      };
      res.status(500);
    }
  }

  res.json(apiResponse);
};