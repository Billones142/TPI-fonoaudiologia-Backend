import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js';
import { prisma } from "../lib/prisma";
import { gamesSecret } from '../config/env';
import { Coordenates, Game, Scene, SceneObject, SceneObjectJWTPayload, SceneObjectToSelect } from '../types/models/games';
import { Prisma } from '@prisma/client';

export function getShuffledIndexes(array: Array<unknown>): Array<number> {
  return array.map((_, index) => index).sort(() => Math.random() - 0.5);
}

export function encriptarSelectorObjeto(objeto: SceneObject, isGameResult: boolean, escenario: Scene, tiempoDeGeneracion: number): string {
  // modificar por solo el id del objeto
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

export function desencriptarSelectorObjeto(encryptedJWT: string): SceneObjectJWTPayload {
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
export async function generarJuegosAleatorios(sceneId: string, jokerObjectsAmmount: number, profileId: string): Promise<Array<Game>> {
  // Buscar el escenario en la base de datos
  const escenario = await prisma.escenario.findUnique({
    where: { id: sceneId },
    include: {
      objetos: true,
    },
  });

  if (!escenario) {
    throw new Error('No scene with that id found');
  }

  const tiempoDeGeneracion = Date.now();
  const shuffledGames: Array<Game> = [];

  // For each object in the scene, create a game where it's the correct one
  for (const correctObject of escenario.objetos) {
    // Shuffle and take the amount of jokers needed
    const jokerObjects = escenario.objetos
      .filter(obj => obj.id !== correctObject.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, jokerObjectsAmmount);

    const principalObject: SceneObjectToSelect = {
      name: correctObject.nombre,
      verticesLocation: JSON.parse(correctObject.coordenadas) as Coordenates,
      imageUrl: correctObject.imagenUrl,
      videoUrl: correctObject.videoSenaUrl,
      selectionId: encriptarSelectorObjeto(
        {
          name: correctObject.nombre,
          verticesLocation: JSON.parse(correctObject.coordenadas) as Coordenates,
          imageUrl: correctObject.imagenUrl,
          videoUrl: correctObject.videoSenaUrl,
        },
        true,
        {
          id: escenario.id,
          name: escenario.nombre,
          objects: escenario.objetos.map(obj => ({
            name: obj.nombre,
            verticesLocation: JSON.parse(obj.coordenadas) as Coordenates,
            imageUrl: obj.imagenUrl,
            videoUrl: obj.videoSenaUrl,
          })),
        },
        tiempoDeGeneracion,
      ),
    };

    const jokerObjectsWithIds: SceneObjectToSelect[] = jokerObjects.map(jokerObject => ({
      name: jokerObject.nombre,
      verticesLocation: JSON.parse(jokerObject.coordenadas) as Coordenates,
      imageUrl: jokerObject.imagenUrl,
      videoUrl: jokerObject.videoSenaUrl,
      selectionId: encriptarSelectorObjeto(
        {
          name: jokerObject.nombre,
          verticesLocation: JSON.parse(jokerObject.coordenadas) as Coordenates,
          imageUrl: jokerObject.imagenUrl,
          videoUrl: jokerObject.videoSenaUrl,
        },
        false,
        {
          id: escenario.id,
          name: escenario.nombre,
          objects: escenario.objetos.map(obj => ({
            name: obj.nombre,
            verticesLocation: JSON.parse(obj.coordenadas) as Coordenates,
            imageUrl: obj.imagenUrl,
            videoUrl: obj.videoSenaUrl,
          })),
        },
        tiempoDeGeneracion,
      ),
    }));

    const objectsForGame = [principalObject, ...jokerObjectsWithIds];
    const shuffledObjectsForGame: SceneObjectToSelect[] = [];
    const shuffledObjectIndexes = getShuffledIndexes(objectsForGame);

    shuffledObjectIndexes.forEach(objectIndex => {
      shuffledObjectsForGame.push(objectsForGame[objectIndex]); // TODO: buscar error donde el primero siempre es el correcto
    });

    shuffledGames.push({
      videoUrl: principalObject.videoUrl,
      objects: shuffledObjectsForGame,
    });
  }

  const generationTime = new Date();
  // TODO: agregar a la base de datos cada juego
  await prisma.sesionJuego.create({
    data: {
      aciertos: 0,
      errores: 0,
      inicio: generationTime,
      juegosTotales: shuffledGames.length,
      escenarioId: sceneId,
      perfilId: profileId,
      juegos: {
        createMany: {
          data: [
            ...shuffledGames.map<Prisma.JuegoCreateManySesionJuegoInput>(game => {
              const objetoCorrectoId = escenario.objetos.find(objeto => objeto.videoSenaUrl === game.videoUrl)?.id as string;
              return {
                objetoCorrectoId: objetoCorrectoId,
              };
            }),
          ],
        },
      },
    },
  });


  return shuffledGames;
}

export async function procesarRespuestaEnBaseDeDatos(objectSelectionIdPayload: SceneObjectJWTPayload) { // TODO
  const progresoAnterior = await prisma.progresoEscenario.findFirst({
    where: {
      escenarioId: objectSelectionIdPayload.sceneId,
    },
  });

  if (!progresoAnterior) {
    throw new Error('El escenario al que el objeto hace referencia no existe');
  }

  const sesionJuego = await prisma.sesionJuego.findFirst({
    where: {

    },
  });// TODO: borrar

  if (objectSelectionIdPayload.isGameResult) {
    // TODO: agregar una forma para no permitir que puedan enviar varias veces el mismo
    await prisma.progresoEscenario.update({
      where: { id: progresoAnterior.id },
      data: {
        objetosReconocidos: progresoAnterior.objetosTotales + 1, // TODO: modificar por una lista de los ID?
      },
    });
  }
}