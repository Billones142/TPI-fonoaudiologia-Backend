/* eslint-disable no-console */
import request, { Response } from 'supertest';
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';

import app from '../app';
import { prisma } from '../lib/prisma';

const appRequest = request(app);
let usuario: {
  name: string,
  id: string,
  email: string,
  password: string,
  rol: 'PACIENTE' | 'MEDICO',
  medicoId: string | null,
  createdAt: Date,
  updatedAt: Date,
  perfiles: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    nombre: string;
    avatarUrl: string;
    usuarioId: string;
  }[]
};

beforeAll(async () => { // crear usuario con perfil temporal en la base de datos
  usuario = await prisma.usuario.create({
    data: {
      email: `prueba-${Date.now()}@example.com`,
      password: 'contraseniaPrueba',
      rol: 'PACIENTE',
      name: 'Nombre Prueba',
      perfiles: {
        create: {
          avatarUrl: 'UrlAvatarUsuarioPrueba',
          nombre: 'Perfil de prueba',
        },
      },
    },
    include: {
      perfiles: true,
    },
  });
});

afterAll(async () => { // borrar el usuario y perfil temporal de la base de datos
  // First delete all profiles associated with the user
  await prisma.perfil.deleteMany({
    where: {
      usuarioId: usuario.id,
    },
  });

  // Then delete the user
  await prisma.usuario.delete({
    where: {
      id: usuario.id,
    },
  });
});

function extractCookieFromResponse<T extends readonly string[]>(
  response: Response,
  ...cookieNames: T
): { [K in T[number]]: string | null } { // Mata, hice esta funcion asi de complicada porque pintó, queria probar algo
  const cookies = response.headers['set-cookie'] as unknown as Array<string>;
  const result = {} as { [K in T[number]]: string | null };

  if (Array.isArray(cookies)) {
    for (const name of cookieNames) {
      const cookie = cookies.find((cookie: string) => cookie.startsWith(`${name}=`))?.split(';')[0].split('=')[1];
      result[name as T[number]] = cookie || null;
    }
  } else {
    for (const name of cookieNames) {
      result[name as T[number]] = null;
    }
  }

  return result;
}

describe('Login and select profile', () => {
  let extractedSessionid: string;

  test('login should return token and user data', async () => {
    const response = await appRequest
      .post('/api/v1/user/login')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send(`email=${usuario.email}&password=${usuario.password}`);

    expect(response.status).toBe(200);
    const responseBody = response.body as { message: string };
    expect(responseBody).toHaveProperty('message');
    expect(responseBody.message).toBe('Login successful');

    // check cookie existence
    const { sessionid } = extractCookieFromResponse(response, 'sessionid');
    expect(extractedSessionid).toBeTruthy();
    extractedSessionid = sessionid as string;
  }, 1000 * 60 * 60);

  test('obtener primer perfil', async () => {
    const response = await appRequest
      .get('/api/v1/user/getProfiles')
      .set('Cookie', [`sessionid=${extractedSessionid}`]);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('profiles');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.body.profiles).toBeInstanceOf(Array);
  });

  test('seleccionar perfil should return success', async () => {
    const perfilId = usuario.perfiles[0].id;

    // Then try to select the profile
    const response = await appRequest
      .post('/api/v1/user/selectProfile')
      .set('Cookie', [`sessionid=${extractedSessionid}`])
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send(`profile_id=${perfilId}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Profile selected succesfully');

    const { profilesession } = extractCookieFromResponse(response, 'profilesession');
    expect(profilesession).toBeTruthy();
  }, 1000 * 60 * 60);
});