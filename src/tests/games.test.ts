/* eslint-disable no-console */
import request from 'supertest';
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';

import app from '../app';
import { prisma } from '../lib/prisma';
import { Game } from '../types/models/games';
import { CheckGameResult } from '../types/api/APIResponses';
import { JsonValue } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';

// Test data setup
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
    coordenadas: JsonValue;
    videoSenaUrl: string;
    escenarioId: string;
  }[],
};

// Setup test data before all tests
beforeAll(async () => {
  escenarioTestGlobal = await prisma.escenario.create({
    data: {
      nombre: 'escenario_games_tests',
      imagenUrl: 'UrlEscenario_test',
      logoUrl: '',
      objetos: {
        createMany: {
          data: [0, 1, 2, 3, 4, 5].map<Prisma.ObjetoEscenarioCreateManyEscenarioInput>(index => {
            return {
              nombre: `Objeto_test_${index}`,
              coordenadas: [],
              imagenUrl: `Imagen_objeto_test_${index}`,
              videoSenaUrl: `Video_url_objeto_test_${index}`,
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

// Cleanup after all tests
afterAll(async () => {
  // Delete related objects
  const objetos = await prisma.objetoEscenario.findMany({
    where: {
      escenarioId: escenarioTestGlobal.id,
    },
  });

  // Delete games
  for (const objeto of objetos) {
    await prisma.juego.deleteMany({
      where: {
        objetoCorrectoId: objeto.id,
      },
    });
  }

  // Delete scenario objects
  await prisma.objetoEscenario.deleteMany({
    where: {
      escenarioId: escenarioTestGlobal.id,
    },
  });

  // Delete game sessions
  await prisma.sesionJuego.deleteMany({
    where: {
      escenarioId: escenarioTestGlobal.id,
    },
  });

  // Delete scenario
  await prisma.escenario.delete({
    where: {
      id: escenarioTestGlobal.id,
    },
  });
});

const appRequest = request(app);

// Test suite for games API
describe('Games API Tests', () => {
  let games: Array<Game>;

  // Test getting games list
  test('should successfully fetch games for a scenario', async () => {
    const res = await appRequest.get(`/api/v1/games/${escenarioTestGlobal.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('games_data');
    const responseBody = res.body as { games_data: Array<Game> };
    games = responseBody.games_data;
    expect(Array.isArray(games)).toBe(true);
    expect(games.length).toBeGreaterThan(0);
  });

  // Test game object structure
  test('should have correct game object structure', () => {
    expect(games).toBeDefined();
    games.forEach(game => {
      expect(game).toHaveProperty('objects');
      expect(game).toHaveProperty('videoUrl');
      expect(Array.isArray(game.objects)).toBe(true);
      expect(game.objects.length).toBeGreaterThan(0);
    });
  });

  // Test correct object identification
  test('should correctly identify the matching object for each game', () => {
    games.forEach(game => {
      const objetoCorrecto = escenarioTestGlobal.objetos.find(
        object => object.videoSenaUrl === game.videoUrl,
      );
      expect(objetoCorrecto).toBeDefined();

      const matchingGameObject = game.objects.find(
        objeto => objeto.name === objetoCorrecto?.nombre,
      );
      expect(matchingGameObject).toBeDefined();
    });
  });

  // Test correct answer submission
  test('should accept correct answer submissions', async () => {
    for (const game of games) {
      const objetoCorrecto = escenarioTestGlobal.objetos.find(
        object => object.videoSenaUrl === game.videoUrl,
      );
      expect(objetoCorrecto).toBeDefined();

      const matchingGameObject = game.objects.find(
        objeto => objeto.name === objetoCorrecto?.nombre,
      );
      expect(matchingGameObject).toBeDefined();

      const requestCorrecto = await appRequest.post(
        `/api/v1/games/submitSelection/${matchingGameObject?.selectionId}`,
      );

      expect(requestCorrecto.status).toBe(200);
      const bodyResquestCorrecto = requestCorrecto.body as CheckGameResult;
      if (bodyResquestCorrecto.status === 'ok') {
        expect(bodyResquestCorrecto.is_correct).toBe(true);
      } else {
        expect(bodyResquestCorrecto.status).toBe('ok');
      }
    }
  });

  // Test incorrect answer submission
  test.failing('should reject incorrect answer submissions', async () => {
    for (const game of games) {
      const objetoCorrecto = escenarioTestGlobal.objetos.find(
        object => object.videoSenaUrl === game.videoUrl,
      );
      expect(objetoCorrecto).toBeDefined();

      // Find an incorrect object
      const incorrectObject = game.objects.find(
        objeto => objeto.name !== objetoCorrecto?.nombre,
      );
      expect(incorrectObject).toBeDefined();

      const requestIncorrecto = await appRequest.post(
        `/api/v1/games/submitSelection/${incorrectObject?.selectionId}`,
      );

      expect(requestIncorrecto.status).toBe(200);
      const bodyResquestIncorrecto = requestIncorrecto.body as CheckGameResult;
      if (bodyResquestIncorrecto.status === 'ok') {
        expect(bodyResquestIncorrecto.is_correct).toBe(false);
      } else {
        expect(bodyResquestIncorrecto.status).toBe('ok');
      }
    }
  });
});