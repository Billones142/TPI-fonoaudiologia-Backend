/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable no-console */
import request from 'supertest';
import { describe, test, expect, beforeAll, afterEach } from '@jest/globals';

import app from '../app';
import { escenarios, Game } from '../api/controllers/gamesControllers';

const appRequest = request(app);

test.each(['123456'])('generacion de juegos', async (gameId) => {
  console.debug(`testeando juego con id ${gameId}`);
  const res = await appRequest.get(`/api/v1/games/${gameId}`);
  expect(res.status).toBe(200);
  //console.info(res.body);
  const games = res.body.gamesData as Array<Game>;

  const foundUrls = {
    image: Array<string>(),
    video: Array<string>(),
  };
  for (let index = 0; index < games.length; index++) {
    const game = games[index];
    // chequear que de bien el resultado
    const objetoCorrecto2 = escenarios[0].objects.find(object => object.videoUrl === game.videoUrl);
    if (!objetoCorrecto2) {
      expect(true).toBe(false);
      throw new Error();
    }
    const objetoCorrecto = game.objects.find(objeto => objeto.name === objetoCorrecto2.name);
    if (!objetoCorrecto) {
      expect(true).toBe(false);
      throw new Error();
    }
    foundUrls.video.push(objetoCorrecto.videoUrl);
    foundUrls.image.push(objetoCorrecto.imageUrl);
    console.debug('objeto correcto', JSON.stringify(objetoCorrecto, null, 2));
    const requesCorrecto = await appRequest.post(`/api/v1/games/submitSelection/${objetoCorrecto.selectionId}`);
    expect(requesCorrecto.status).toBe(200);
    console.log(JSON.stringify(requesCorrecto, null, 2));
  }
});