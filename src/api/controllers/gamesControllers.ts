import { Handler, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { gamesSecret } from "../../config/env";


const escenarios: Scene[] = [ // TODO: temporal mientras no hay base de datos
  {
    id: 'abcd1',
    objects: [
      {
        name: 'Tenedor',
        position: {},
        imageUrl: 'imagen1', // TODO cambiar
        videoUrl: 'video1',
      },
      {
        name: 'Televisor',
        position: {},
        imageUrl: 'imagen2', // TODO cambiar
        videoUrl: 'video2',
      },
      {
        name: 'Microondas',
        position: {},
        imageUrl: 'imagen3', // TODO cambiar
        videoUrl: 'video3',
      }
    ],
  },
]

interface Scene {
  id: string,
  objects: SceneObject[],
}

interface SceneObject {
  name: string,
  position: object, // TODO: especificar
  imageUrl: string,
  videoUrl: string,
}

interface SceneObjectToSelect extends SceneObject {
  /** JWT that will contain in the payload if it is correct or not */
  selectionId: string,
}

function getShuffledIndexes(array: Array<unknown>): Array<number> {
  return array.map((_, index) => index).sort(() => Math.random() - 0.5)
}

/**
 * 
 * @param sceneId 
 * @param jokerObjectsAmmount ammout of objects that will be added with co
 * @returns 
 */
async function generarJuegosAleatorios(sceneId: string, jokerObjectsAmmount: number): Promise<Array<SceneObjectToSelect[]>> {
  const escenario = escenarios.find(escenario => escenario.id === sceneId);
  if (!escenario) {
    throw new Error('No scene with that id found');
  }

  const shuffledGames: Array<SceneObjectToSelect[]> = [];

  // For each object in the scene, create a game where it's the correct one
  escenario.objects.forEach((_, correctObjectIndex) => {
    // Shuffle and take the amount of jokers needed
    const jokerObjectsIndexes = getShuffledIndexes(escenario.objects)
      .filter(jokerIndex => escenario.objects[jokerIndex].name !== escenario.objects[correctObjectIndex].name)
      .slice(0, jokerObjectsAmmount);

    const principalObject = {
      ...escenario.objects[correctObjectIndex],
      selectionId: jwt.sign(
        {
          isGameResult: true,
          objectName: escenario.objects[correctObjectIndex].name,
          sceneId: escenario.id,
          variator: Math.random(), // payload to alter the final jwt and make it diferent
        }, gamesSecret)
    };

    const jokerObjects = jokerObjectsIndexes.map(jokerIndex => ({
      ...escenario.objects[jokerIndex],
      selectionId: jwt.sign(
        {
          isGameResult: false,
          objectName: escenario.objects[jokerIndex].name,
          sceneId: escenario.id,
          variator: Math.random(), // payload to alter the final jwt and make it diferent
        }, gamesSecret),
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

export const checkGameResult: Handler = async (req: Request, res: Response) => { // TODO
  const { selectionId } = req.params;
};