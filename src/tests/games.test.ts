/* eslint-disable no-console */
import request from 'supertest';
import { describe, test, expect, beforeAll, afterEach, afterAll } from '@jest/globals';

import app from '../app';
import { prisma } from '../lib/prisma';
import { Game } from '../types/models/games';
import { CheckGameResult } from '../types/api/APIResponses';

let escenarioTestGlobal: {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  nombre: string;
  descripcion: string | null;
  imagenUrl: string;
  objetos: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    nombre: string;
    imagenUrl: string;
    coordenadas: string;
    videoSenaUrl: string;
    escenarioId: string;
  }[],
};

beforeAll(async () => {
  //await prisma.usuario.create({
  //  data: {
  //    name: 'PruebaUsuario',
  //    password: 'aklsfjlasdfñlasldjfsdl',
  //    rol: 'MEDICO',
  //    email: 'akldajkfljaks@galkdjfglas.com',
  //    perfiles: {
  //      create: {
  //        avatarUrl: 'alsfasdjf',
  //        nombre: 'PruebaPerfil',
  //      },
  //    },
  //  },
  //});
  escenarioTestGlobal = await prisma.escenario.create({
    data: {
      nombre: 'escenario_games_tests',
      imagenUrl: 'UrlEscenario_test',
      objetos: {
        createMany: {
          data: [0, 1, 2, 3, 4, 5].map(index => {
            const timeNow = new Date();
            return {
              nombre: `Objeto_test_${index}`,
              coordenadas: '[]',
              imagenUrl: `Imagen_objeto_test_${index}`,
              videoSenaUrl: `Video_url_objeto_test_${index}`,
              createdAt: timeNow,
              updatedAt: timeNow,
            };
          }),
        },
      },
    },
    include: {
      objetos: true,
    },
  });
});

afterAll(async () => {
  // obtener los objetos relacionados, borrarlos
  const objetos = await prisma.objetoEscenario.findMany({
    where: {
      escenarioId: escenarioTestGlobal.id,
    },
  });
  for (const objeto of objetos) {
    await prisma.juego.deleteMany({
      where: {
        objetoCorrectoId: objeto.id,
      },
    });
  }


  await prisma.objetoEscenario.deleteMany({
    where: {
      escenarioId: escenarioTestGlobal.id,
    },
  });

  await prisma.sesionJuego.deleteMany({
    where: {
      escenarioId: escenarioTestGlobal.id,
    },
  });

  await prisma.escenario.delete({
    where: {
      id: escenarioTestGlobal.id,
    },
  });
});

const appRequest = request(app);

test('generacion de juegos', async () => {
  console.debug(`testeando juego con id ${escenarioTestGlobal.id}`);
  const res = await appRequest.get(`/api/v1/games/${escenarioTestGlobal.id}`);
  expect(res.status).toBe(200);
  //console.info(res.body);
  const games = (res.body as { games_data: Array<Game> }).games_data;

  const foundUrls = {
    image: Array<string>(),
    video: Array<string>(),
  };
  for (let index = 0; index < games.length; index++) {
    const game = games[index];
    // chequear que de bien el resultado
    const objetoCorrecto2 = escenarioTestGlobal.objetos.find(object => object.videoSenaUrl === game.videoUrl);
    if (!objetoCorrecto2) {
      expect(true).toBe(false);
      throw new Error();
    }
    const objetoCorrecto = game.objects.find(objeto => objeto.name === objetoCorrecto2.nombre);
    if (!objetoCorrecto) {
      expect(true).toBe(false);
      throw new Error();
    }
    foundUrls.video.push(objetoCorrecto.videoUrl);
    foundUrls.image.push(objetoCorrecto.imageUrl);
    console.debug('objeto correcto', JSON.stringify(objetoCorrecto, null, 2));
    const requestCorrecto = await appRequest.post(`/api/v1/games/submitSelection/${objetoCorrecto.selectionId}`);
    const bodyResquestCorrecto = requestCorrecto.body as CheckGameResult;
    expect(requestCorrecto.status).toBe(200);
    if (bodyResquestCorrecto.status === 'ok') {
      expect(bodyResquestCorrecto.is_correct).toBe(true);
    } else {
      expect(false).toBe(true);
    }
    //console.log(JSON.stringify(requestCorrecto, null, 2));
  }

  // TODO agregar test para controlar los resultados de la base de datos
}, 60 * 60 * 24 * 20 * 1000);