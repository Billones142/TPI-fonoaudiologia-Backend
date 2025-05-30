import { Game } from '../models/games';

interface APIResponse {
  status: 'ok' | 'error',
  error?: ArrayLike<string>;
}

interface APIResponse_Ok extends APIResponse {
  status: 'ok';
}

interface APIResponse_Error {
  status: 'error',
  error: ArrayLike<string>;
}

interface GetGamesResponse_Ok extends APIResponse_Ok {
  status: 'ok';
  games_data: ArrayLike<Game>;
}

interface GetGamesResponse_Fail extends APIResponse_Error { // TODO: ver si es necesario tener esta interfaz
  name: unknown,
}

interface CheckGameResult_Ok extends APIResponse_Ok {
  is_correct: boolean,
  scene_id: string,
  object_name: string,
}

export type GetGamesResponse = GetGamesResponse_Ok | APIResponse_Error;
export type CheckGameResult = CheckGameResult_Ok | APIResponse_Error; // TODO