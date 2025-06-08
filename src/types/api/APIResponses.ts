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

interface CheckGameResult_Ok extends APIResponse_Ok {
  is_correct: boolean,
  game_session_id: string,
  object_id: string,
}

interface GetProgressedScenesResponse_Ok extends APIResponse_Ok {
  scenesWithProgress: ArrayLike<>; //TODO
}

export type GetProgressedScenesResponse = GetProgressedScenesResponse_Ok | APIResponse_Error;
export type GetGamesResponse = GetGamesResponse_Ok | APIResponse_Error;
export type CheckGameResult = CheckGameResult_Ok | APIResponse_Error;