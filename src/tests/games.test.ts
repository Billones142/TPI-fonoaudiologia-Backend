/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import request, { Response as SuperRespose } from 'supertest';
import { describe, test, expect, beforeAll, afterEach } from '@jest/globals';

import app from '../app';

test('generacion de juegos', async () => { // TODO
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const res = await request(app).get(`/api/v1/games/${'abcd1'}`) as SuperRespose;
  expect(res.status).toBe(200);
  console.info(res.body);
}); 