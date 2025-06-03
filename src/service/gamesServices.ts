import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js';
import { prisma } from "../lib/prisma";
import { gamesSecret } from '../config/env';
import { Game, SceneObjectJWTPayload, SceneObjectToSelect } from '../types/models/games';
import { Prisma } from '@prisma/client';

export function getShuffledIndexes(array: Array<unknown>): Array<number> {
  // Create array of indexes
  const indexes = array.map((_, index) => index);

  // Fisher-Yates shuffle algorithm
  for (let i = indexes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
  }

  return indexes;
}

export function encriptarSelectorObjeto(objectId: string, sessionId: string, isGameResult: boolean, generationTime: number): string {
  // modificar por solo el id del objeto
  const payload: SceneObjectJWTPayload = {
    isGameResult: isGameResult,
    objectId: objectId,
    sessionId: sessionId,
    generationTime: generationTime,
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
  const generationTime = new Date();

  // se crea la sesion de juego
  const sessionJuego = await prisma.sesionJuego.create({
    data: {
      aciertos: 0,
      errores: 0,
      inicio: generationTime,
      juegosTotales: escenario.objetos.length,
      escenarioId: sceneId,
      perfilId: profileId,
    },
  });

  const games: Array<Game> = [];

  // For each object in the scene, create a game where it's the correct one
  for (const correctObject of escenario.objetos) {
    // Shuffle and take the amount of jokers needed
    const jokerObjects = escenario.objetos
      .filter(obj => obj.id !== correctObject.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, jokerObjectsAmmount);

    const principalObject: SceneObjectToSelect = {
      name: correctObject.nombre,
      imageUrl: correctObject.imagenUrl,
      videoUrl: correctObject.videoSenaUrl,
      id: correctObject.id,
      selectionId: encriptarSelectorObjeto(
        correctObject.id,
        sessionJuego.id,
        true,
        tiempoDeGeneracion,
      ),
    };

    const jokerObjectsWithIds: SceneObjectToSelect[] = jokerObjects.map(jokerObject => ({
      name: jokerObject.nombre,
      imageUrl: jokerObject.imagenUrl,
      videoUrl: jokerObject.videoSenaUrl,
      id: jokerObject.id,
      selectionId: encriptarSelectorObjeto(
        jokerObject.id,
        sessionJuego.id,
        false,
        tiempoDeGeneracion,
      ),
    }));

    const objectsForGame = [principalObject, ...jokerObjectsWithIds];
    const shuffledObjectsForGame: SceneObjectToSelect[] = [];
    const shuffledObjectIndexes = getShuffledIndexes(objectsForGame);

    shuffledObjectIndexes.forEach(objectIndex => {
      shuffledObjectsForGame.push(objectsForGame[objectIndex]); // TODO: buscar error donde el primero siempre es el correcto
    });

    games.push({
      videoUrl: principalObject.videoUrl,
      objects: shuffledObjectsForGame,
    });
  }

  const shuffledGames: Array<Game> = [];
  const shuffledGamesIndexes = getShuffledIndexes(games);

  shuffledGamesIndexes.forEach(gameIndex => {
    shuffledGames.push(games[gameIndex]);
  });

  // se agregan los juegos creados a la sesion de juego
  await prisma.sesionJuego.update({
    where: {
      id: sessionJuego.id,
    },
    data: {
      juegos: {
        createMany: {
          data: [
            ...games.map<Prisma.JuegoCreateManySesionJuegoInput>(game => {
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

export async function procesarRespuestaEnBaseDeDatos(selectionId: string): Promise<SceneObjectJWTPayload> {
  const objectSelectionIdPayload = desencriptarSelectorObjeto(selectionId);

  // TODO: chequear que el id lo envia el mismo usuario y perfil
  // TODO: agregar una forma para no permitir que puedan enviar varias veces el mismo, encontrar el juego del objeto mediante la sesion de juego

  const juego = await prisma.juego.findFirst({
    where: {
      sesionJuegoId: objectSelectionIdPayload.sessionId,
    }
  });

  if (!juego) {
    throw new Error('No se encontro el juego al que el selector hace referencia');
  }

  const sesionJuego = prisma.sesionJuego;

  // si se creo hace mas de 2 * cantidad de juegos minutos

  await prisma.juego.update({
    where: {
      id: juego.id,
    },
    data: {
      objetoSeleccionadoId: objectSelectionIdPayload.objectId,
    },
  });

  if (objectSelectionIdPayload.isGameResult) {
    await prisma.sesionJuego.update({
      where: {
        id: objectSelectionIdPayload.sessionId,
      },
      data: {
        aciertos: {
          increment: 1
        }
      },
    });
  } else {
    await prisma.sesionJuego.update({
      where: {
        id: objectSelectionIdPayload.sessionId,
      },
      data: {
        errores: {
          increment: 1
        }
      },
    });
  }

  return objectSelectionIdPayload;
}