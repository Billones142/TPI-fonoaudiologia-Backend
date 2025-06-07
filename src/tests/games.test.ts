/* eslint-disable no-console */
import { describe, test, expect, beforeAll, mock } from 'bun:test';
import { Request, Response, NextFunction } from 'express';

import { getGames, checkGameResult } from '../api/controllers/gamesControllers';
import { Game } from '../types/models/games';
import { CheckGameResult, GetGamesResponse } from '../types/api/APIResponses';
import { JsonValue } from '@prisma/client/runtime/library';

// Mock Prisma client
const mockPrisma = {
  escenario: {
    create: mock(() => Promise.resolve({
      id: 'test-scenario-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      nombre: 'escenario_games_tests',
      descripcion: null,
      imagenUrl: 'UrlEscenario_test',
      logoUrl: '',
      objetos: [0, 1, 2, 3, 4, 5].map(index => ({
        id: `test-object-${index}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        nombre: `Objeto_test_${index}`,
        imagenUrl: `Imagen_objeto_test_${index}`,
        coordenadas: [],
        videoSenaUrl: `Video_url_objeto_test_${index}`,
        escenarioId: 'test-scenario-id',
      })),
    })),
    findUnique: mock(() => Promise.resolve({
      id: 'test-scenario-id',
      nombre: 'escenario_games_tests',
      objetos: [0, 1, 2, 3, 4, 5].map(index => ({
        id: `test-object-${index}`,
        nombre: `Objeto_test_${index}`,
        videoSenaUrl: `Video_url_objeto_test_${index}`,
      })),
    })),
  },
  perfil: {
    findMany: mock(() => Promise.resolve([{
      id: 'test-profile-id',
      nombre: 'Test Profile',
      avatarUrl: 'test-avatar',
      usuarioId: 'test-user-id',
      createdAt: new Date(),
      updatedAt: new Date(),
    }])),
  },
  juego: {
    create: mock(() => Promise.resolve({
      id: 'test-game-id',
      objetoCorrectoId: 'test-object-0',
      sesionJuegoId: 'test-session-id',
    })),
    findFirst: mock(() => Promise.resolve({
      id: 'test-game-id',
      objetoCorrectoId: 'test-object-0',
      sesionJuegoId: 'test-session-id',
      objetoSeleccionadoId: null,
    })),
    update: mock(() => Promise.resolve({
      id: 'test-game-id',
      objetoCorrectoId: 'test-object-0',
      sesionJuegoId: 'test-session-id',
      objetoSeleccionadoId: 'test-object-0',
    })),
  },
  sesionJuego: {
    create: mock(() => Promise.resolve({
      id: 'test-session-id',
      inicio: new Date(),
      juegosTotales: 1,
      aciertos: 0,
      errores: 0,
      perfilId: 'test-profile-id',
      escenarioId: 'test-scenario-id',
      createdAt: new Date(),
    })),
    findUnique: mock(() => Promise.resolve({
      id: 'test-session-id',
      createdAt: new Date(),
      juegosTotales: 1,
    })),
    update: mock(() => Promise.resolve({
      id: 'test-session-id',
      aciertos: 1,
      errores: 0,
    })),
  },
};

// Mock the prisma import
void mock.module('../lib/prisma', () => ({
  prisma: mockPrisma,
}));

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
  escenarioTestGlobal = await mockPrisma.escenario.create();
});

// Test suite for games API
describe('Games API Tests', () => {
  let games: Array<Game>;

  // Test getting games list
  test('should successfully fetch games for a scenario', async () => {
    const req = {
      params: { sceneId: escenarioTestGlobal.id },
    } as unknown as Request;

    let responseData: GetGamesResponse | undefined;
    const res = {
      status: mock(() => res),
      json: mock((data: GetGamesResponse) => {
        responseData = data;
        return data;
      }),
    } as unknown as Response;

    const next = mock(() => { }) as NextFunction;

    await getGames(req, res, next);
    expect(responseData).toBeDefined();
    expect(responseData?.status).toBe('ok');
    if (responseData?.status === 'ok') {
      expect(responseData).toHaveProperty('games_data');
      games = responseData.games_data as Array<Game>;
      expect(Array.isArray(games)).toBe(true);
      expect(games.length).toBeGreaterThan(0);
    } else {
      throw new Error('Expected successful response');
    }
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

      const req = {
        params: { selectionId: matchingGameObject?.selectionId },
      } as unknown as Request;

      let responseData: CheckGameResult | undefined;
      const res = {
        status: mock(() => res),
        json: mock((data: CheckGameResult) => {
          responseData = data;
          return data;
        }),
      } as unknown as Response;

      const next = mock(() => { }) as NextFunction;

      await checkGameResult(req, res, next);
      expect(responseData).toBeDefined();
      expect(responseData?.status).toBe('ok');
      expect(responseData).toHaveProperty('is_correct', true);
    }
  });

  // Test incorrect answer submission
  test('should reject incorrect answer submissions', async () => {
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

      const req = {
        params: { selectionId: incorrectObject?.selectionId },
      } as unknown as Request;

      let responseData: CheckGameResult | undefined;
      const res = {
        status: mock(() => res),
        json: mock((data: CheckGameResult) => {
          responseData = data;
          return data;
        }),
      } as unknown as Response;

      const next = mock(() => { }) as NextFunction;

      await checkGameResult(req, res, next);
      expect(responseData).toBeDefined();
      expect(responseData?.status).toBe('ok');
      expect(responseData).toHaveProperty('is_correct', false);
    }
  });
});