import { Request, Response, NextFunction } from 'express';
import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { userLoggedCheckMiddleware } from '../api/middlewares/checkLogged';

// Mock Supabase client
const mockCreateClient = mock(() => ({}));
void mock.module('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
}));

interface MockSupabaseResponse {
  data: {
    user: {
      id: string;
      email: string | null;
      user_metadata?: {
        username?: string;
      };
    } | null;
  };
  error: Error | null;
}

describe('userLoggedCheckMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      cookies: {},
    };
    const statusMock = mock(() => mockResponse as Response);
    const jsonMock = mock(() => mockResponse as Response);
    mockResponse = {
      status: statusMock as unknown as Response['status'],
      json: jsonMock as unknown as Response['json'],
    };
    nextFunction = mock(() => { });
  });

  test('should return 403 when no authorization header is provided', async () => {
    await userLoggedCheckMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'No authorization token provided',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('should return 403 when authorization header does not start with Bearer', async () => {
    mockRequest.headers = {
      authorization: 'InvalidToken',
    };

    await userLoggedCheckMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'No authorization token provided',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('should return 403 when token is invalid', async () => {
    mockRequest.headers = {
      authorization: 'Bearer invalid-token',
    };

    const mockSupabase = {
      auth: {
        getUser: mock(() => Promise.resolve({
          data: { user: null },
          error: new Error('Invalid token'),
        } as MockSupabaseResponse)),
      },
    };

    mockCreateClient.mockReturnValue(mockSupabase);

    await userLoggedCheckMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid or expired token',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('should set user in request and call next when token is valid', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      user_metadata: {
        username: 'testuser',
      },
    };

    mockRequest.headers = {
      authorization: 'Bearer valid-token',
    };

    const mockSupabase = {
      auth: {
        getUser: mock(() => Promise.resolve({
          data: { user: mockUser },
          error: null,
        } as MockSupabaseResponse)),
      },
    };

    mockCreateClient.mockReturnValue(mockSupabase);

    await userLoggedCheckMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(mockRequest.user).toEqual({
      id: '123',
      email: 'test@example.com',
      name: 'testuser',
    });
    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });
}); 