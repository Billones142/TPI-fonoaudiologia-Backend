import { Handler, Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { GetSceneResponse } from '../../types/api/APIResponses';


/**
 * devuelve una lista de maximo 50 escenas disponibles al usuario
 * @method GET
 * @param req 
 * @param res 
 */
export const getScenes: Handler = async (req: Request, res: Response): Promise<void> => { // TODO
  // metodo: tener en cuenta que hay que obtener de la base un maximo de 51 objetos, asi se le devuelve los 50 primeros al usuario y si hay un 51 se le devuelve el id del 51 como maxId
  // obtener el max id del usuario
  // si el max id esta vacio entonces darle los primeros que se encuentran
  // si el max id no esta vacio darle el resto de las escenas hasta un maximo de 50

  // si no hay mas posts no devolver un maxID
}

/**
 * @method GET
 * @param req 
 * @param res 
 */
export const getSceneData: Handler = async (req: Request, res: Response): Promise<void> => { // TODO
  const { sceneId } = req.params;
  let apiResponse: GetSceneResponse;

  if (sceneId === '') {
    const escena = await prisma.escenario.findFirst({
      where: {
        id: sceneId,
      },
    });

    if (escena) {
      apiResponse = {
        status: 'ok',
        scene_data: {
          id: escena.id,
          name: escena.nombre,
        }
      };
    } else {
      apiResponse = {
        status: 'error',
        error: ['La escena con ese id no existe']
      };
      res.status(404);
    }
  } else {
    apiResponse = {
      status: 'error',
      error: ['No scene id sent'],
    };
  }

  res.json(apiResponse);
}