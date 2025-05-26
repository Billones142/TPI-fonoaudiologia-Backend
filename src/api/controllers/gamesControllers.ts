import { Handler, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { gamesSecret } from '../../config/env';
import CryptoJS from 'crypto-js';


const escenarios: Scene[] = [ // TODO: temporal mientras no hay base de datos
  {
    id: 'abcd1',
    objects: [
      {
        name: 'Tenedor',
        verticesLocation: [],
        imageUrl: 'imagen1', // TODO cambiar
        videoUrl: 'video1',
      },
      {
        name: 'Televisor',
        verticesLocation: [],
        imageUrl: 'imagen2', // TODO cambiar
        videoUrl: 'video2',
      },
      {
        name: 'Microondas',
        verticesLocation: [],
        imageUrl: 'imagen3', // TODO cambiar
        videoUrl: 'video3',
      },
    ],
  },
];

interface Scene {
  id: string,
  objects: SceneObject[],
}

interface SceneObject {
  name: string,
  verticesLocation: [number, number][],
  imageUrl: string,
  videoUrl: string,
}

interface SceneObjectToSelect extends SceneObject {
  /** JWT that will contain in the payload if it is correct or not */
  selectionId: string,
}

interface SceneObjectJWTPayload {
  isGameResult: boolean,
  objectName: string,
  sceneId: string,
  variator: number,
  generationTime: number,
}

function getShuffledIndexes(array: Array<unknown>): Array<number> {
  return array.map((_, index) => index).sort(() => Math.random() - 0.5);
}

function encriptarSelectorObjeto(objeto: SceneObject, isGameResult: boolean, escenario: Scene, tiempoDeGeneracion: number): string {
  const payload: SceneObjectJWTPayload = {
    isGameResult: isGameResult,
    objectName: objeto.name,
    sceneId: escenario.id,
    variator: Math.random(), // payload to alter the final jwt and make it diferent
    generationTime: tiempoDeGeneracion,
  };

  // Encriptar el payload

  const encryptedPayload = CryptoJS.AES.encrypt(JSON.stringify(payload), gamesSecret).toString();

  const token = jwt.sign({ data: encryptedPayload }, gamesSecret, { expiresIn: '1h' });

  return token;
}

function desencriptarSelectorObjeto(encryptedJWT: string): SceneObjectJWTPayload {
  const decoded = jwt.verify(encryptedJWT, gamesSecret) as { data: string };

  const decryptedBytes = CryptoJS.AES.decrypt(decoded.data, gamesSecret);

  const decryptedPayload = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8)) as SceneObjectJWTPayload;

  return decryptedPayload;
}

/**
 * 
 * @param sceneId 
 * @param jokerObjectsAmmount ammout of objects that will be added with co
 * @returns 
 */
async function generarJuegosAleatorios(sceneId: string, jokerObjectsAmmount: number): Promise<Array<SceneObjectToSelect[]>> { // Encriptar JWT
  const escenario = escenarios.find(escenario => escenario.id === sceneId);

  if (!escenario) {
    throw new Error('No scene with that id found');
  }

  const tiempoDeGeneracion = Date.now();

  const shuffledGames: Array<SceneObjectToSelect[]> = [];

  // For each object in the scene, create a game where it's the correct one
  escenario.objects.forEach((_, correctObjectIndex) => {
    // Shuffle and take the amount of jokers needed
    const jokerObjectsIndexes = getShuffledIndexes(escenario.objects)
      .filter(jokerIndex => escenario.objects[jokerIndex].name !== escenario.objects[correctObjectIndex].name)
      .slice(0, jokerObjectsAmmount);

    const principalObject = {
      ...escenario.objects[correctObjectIndex],
      selectionId: encriptarSelectorObjeto(escenario.objects[correctObjectIndex], true, escenario, tiempoDeGeneracion),
    };

    const jokerObjects = jokerObjectsIndexes.map(jokerIndex => ({
      ...escenario.objects[jokerIndex],
      selectionId: encriptarSelectorObjeto(escenario.objects[jokerIndex], false, escenario, tiempoDeGeneracion),
    }));

    const objectsForGame = [principalObject, ...jokerObjects];
    const shuffledObjectsForGame: SceneObjectToSelect[] = [];
    const shuffledObjectIndexes = getShuffledIndexes(objectsForGame);

    shuffledObjectIndexes.forEach(objectIndex => {
      shuffledObjectsForGame.push(objectsForGame[objectIndex]);
    });

    shuffledGames.push(shuffledObjectsForGame);
  });

  return shuffledGames;
}

export const getGames: Handler = async (req: Request, res: Response) => {
  const { sceneId } = req.params;

  try {
    const juegos = await generarJuegosAleatorios(sceneId, 2);

    res.json({
      gamesData: juegos,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error });
    }
  }
};

export const checkGameResult: Handler = async (req: Request, res: Response): Promise<void> => { // TODO: agregar conexion a la base de datos
  const { selectionId } = req.params;

  if (typeof selectionId !== 'string') {
    throw new Error('Selection id is not a string');
  }

  try {
    const decryptedPayload = desencriptarSelectorObjeto(selectionId);
    if (decryptedPayload.isGameResult) {
      res.json({
        isCorrect: true,
      });
    } else {
      res.json({
        isCorrect: false,
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'JsonWebTokenError' && error.message === 'invalid signature') {
        res.status(406) // code 406: not acceptable
          .json({
            message: 'The token was not valid',
          });
      } else {
        res.status(406)
          .json({
            error: error.message,
          });
      }
    } else {
      res.status(500).json({
        error: error,
      });
    }
  }
};