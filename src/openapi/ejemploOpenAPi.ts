/**
 * A este juego le faltaria la logica del login para obtener las cookies, ya que en un futuro para generar el juego si o si se van a necesitar
 */
import { GamesService, OpenAPI, ScenesService, UserService } from './api-fonoaudiologia';
import { createClient, Session } from '@supabase/supabase-js';

// Estos datos vienen desde tu panel de Supabase
const SUPABASE_URL = 'https://<proyect-id>.supabase.co';
const SUPABASE_ANON_KEY = '<supabase-anon-key>';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Función para actualizar los headers con el token
function updateAPIAuthHeaders(session: Session | null): void {
  if (session?.access_token) {
    OpenAPI.HEADERS = {
      ...OpenAPI.HEADERS,
      'Authorization': `Bearer ${session.access_token}`,
    };
  }
}

// Función para actualizar el header del token de perfil
function updateProfileSessionHeader(token: string): void {
  OpenAPI.HEADERS = {
    ...OpenAPI.HEADERS,
    'profilesession': `Bearer ${token}`,
  };
}

// Suscribirse a cambios en la autenticación
supabase.auth.onAuthStateChange((event, session): void => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    updateAPIAuthHeaders(session);
  }
});

// Configurar la URL base de la API y habilitar el envío de cookies
OpenAPI.BASE = 'http://localhost:8000/api/v1';
OpenAPI.WITH_CREDENTIALS = true; // Necesario para que se envien las cookies en los requests

async function main(): Promise<void> {
  try {
    // Login con Supabase
    const signInData = await supabase.auth.signInWithPassword({
      email: 'example@example.com',
      password: 'passwordExample',
    });

    if (!signInData.data.session?.access_token) {
      throw new Error('No se pudo obtener el token de acceso');
    }

    // Hacer la llamada a la API
    const perfiles = await UserService.getUserProfiles();
    console.log('Perfiles obtenidos:', JSON.stringify(perfiles, null, 2));

    // Seleccionar perfil
    const primerPerfil = perfiles.profiles[0];
    const profileResponse = await UserService.selectUserProfile({ requestBody: { profile_id: primerPerfil.id } });
    if (profileResponse.token) {
      updateProfileSessionHeader(profileResponse.token);
    }
    console.log('Token de perfil actualizado');

    const escenarios = await ScenesService.getScenes();
    const escenarioId = escenarios[0].id;
    const games = await GamesService.getGames({ sceneId: escenarioId });

    console.log(games);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Ejecutar la función
main().catch(console.error);