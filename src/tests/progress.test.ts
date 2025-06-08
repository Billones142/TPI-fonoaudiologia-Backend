import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { Request, Response, NextFunction } from 'express';
import { getProgressedScenesController, getSceneProgressController } from '../api/controllers/progressControllers';
import { Profile } from '../types/models/User';

// Mock prisma
const mockPrisma = {
  escenario: {
    findMany: mock(() => Promise.resolve([])),
  },
  sesionJuego: {
    findMany: mock(() => Promise.resolve([])),
  },
};

void mock.module('../lib/prisma', () => ({
  prisma: mockPrisma,
}));

describe('Progress Controllers', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let responseJson: Record<string, unknown>;

  beforeEach(() => {
    // Setup mock response
    responseJson = {};
    mockResponse = {
      json: mock((data: unknown) => {
        responseJson = data as Record<string, unknown>;
        return mockResponse as Response;
      }),
      status: mock((code: number) => {
        return mockResponse as Response;
      }),
    };

    // Setup mock request
    mockRequest = {
      profile: {
        id: 'test-profile-id',
        name: 'Test Profile',
      } as Profile,
      params: {},
    };

    // Setup mock next function
    mockNext = mock(() => { });

    // Reset all mocks before each test
    mockPrisma.escenario.findMany.mockReset();
    mockPrisma.sesionJuego.findMany.mockReset();
  });

  describe('getProgressedScenes', () => {
    test('should return error when no profile is selected', async () => {
      mockRequest.profile = undefined;

      await getProgressedScenesController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(responseJson).toEqual({
        status: 'error',
        error: ['No se selecciono un perfil'],
      });
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return empty array when no scenes found', async () => {
      // Ensure findMany returns an empty array
      mockPrisma.escenario.findMany.mockResolvedValue([]);

      await getProgressedScenesController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(responseJson).toEqual({
        status: 'ok',
        scenes_with_progress: [],
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return scenes with progress', async () => {
      const mockScenes = [
        {
          id: '1',
          nombre: 'Scene 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          descripcion: null,
          imagenUrl: 'test-image.jpg',
          logoUrl: 'test-logo.jpg',
        },
        {
          id: '2',
          nombre: 'Scene 2',
          createdAt: new Date(),
          updatedAt: new Date(),
          descripcion: null,
          imagenUrl: 'test-image.jpg',
          logoUrl: 'test-logo.jpg',
        },
      ];

      mockPrisma.escenario.findMany.mockResolvedValue(mockScenes as never);

      await getProgressedScenesController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(responseJson).toEqual({
        status: 'ok',
        scenes_with_progress: [
          { id: '1', name: 'Scene 1' },
          { id: '2', name: 'Scene 2' },
        ],
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('getSceneProgressController', () => {
    test('should return error when no profile is selected', async () => {
      mockRequest.profile = undefined;

      await getSceneProgressController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(responseJson).toEqual({
        status: 'error',
        error: ['No se selecciono un perfil'],
      });
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return error when no sceneId is provided', async () => {
      mockRequest.params = {};

      await getSceneProgressController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(responseJson).toEqual({
        status: 'error',
        error: ['ID de escena no proporcionado'],
      });
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return empty array when no sessions found', async () => {
      mockRequest.params = { sceneId: 'test-scene-id' };
      // Ensure findMany returns an empty array
      mockPrisma.sesionJuego.findMany.mockResolvedValue([]);

      await getSceneProgressController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(responseJson).toEqual({
        status: 'ok',
        scenes_game_sessions: [],
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return game sessions with progress', async () => {
      mockRequest.params = { sceneId: 'test-scene-id' };

      const mockSessions = [
        {
          id: '1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          inicio: new Date('2024-01-01'),
          fin: new Date('2024-01-01T00:01:00'),
          juegosTotales: 10,
          aciertos: 5,
          errores: 5,
          perfilId: 'test-profile-id',
          escenarioId: 'test-scene-id',
          juegos: [
            {
              id: '1',
              updatedAt: new Date('2024-01-01T00:01:00'),
            },
          ],
        },
      ];

      mockPrisma.sesionJuego.findMany.mockResolvedValue(mockSessions as never);

      await getSceneProgressController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(responseJson).toEqual({
        status: 'ok',
        scenes_game_sessions: [
          {
            intento: 1,
            aciertos: 5,
            totalPreguntas: 10,
            tiempoCompletado: 60, // 1 minute in seconds
          },
        ],
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should handle database errors', async () => {
      mockRequest.params = { sceneId: 'test-scene-id' };
      mockPrisma.sesionJuego.findMany.mockRejectedValue(new Error('DB Error'));

      await getSceneProgressController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(responseJson).toEqual({
        status: 'error',
        error: ['Error al obtener el progreso de la escena'],
      });
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
