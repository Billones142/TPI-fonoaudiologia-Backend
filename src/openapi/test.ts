/**
 * Codigo para probar el codigo generado, no usar en el front
 */
import { GamesService, OpenAPI, ScenesService, UserService } from './api-fonoaudiologia';
import { createClient, Session } from '@supabase/supabase-js';
import axios from 'axios';

// Estos datos vienen desde tu panel de Supabase
const SUPABASE_URL = 'https://odvdytfvbwhuhxaffzls.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kdmR5dGZ2YndodWh4YWZmemxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MTQ5ODcsImV4cCI6MjA2NDE5MDk4N30.RMmgV9a2CIwQ1JetBCTfR5w4WyT3g7UTbxVPzO_iSB4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Configuración inicial de OpenAPI
OpenAPI.BASE = 'http://localhost:8000/api/v1';
OpenAPI.WITH_CREDENTIALS = true;
OpenAPI.CREDENTIALS = 'include';

// Configure axios defaults
axios.defaults.withCredentials = true;

// Función para actualizar los headers con el token
function updateAPIAuthHeaders(session: Session | null): void {
  if (session?.access_token) {
    OpenAPI.HEADERS = {
      ...OpenAPI.HEADERS,
      'Authorization': `Bearer ${session.access_token}`,
    };
    console.log('Headers actualizados:', OpenAPI.HEADERS);
  }
}

async function main() {
  try {
    // Login con Supabase
    const signInData = await supabase.auth.signInWithPassword({
      email: 'julio123@gmail.com',
      password: 'julio123',
    });

    if (!signInData.data.session?.access_token) {
      throw new Error('No se pudo obtener el token de acceso');
    }

    // Hacer la llamada a la API
    const perfiles = await UserService.getUserProfiles();
    console.log('Perfiles obtenidos:', JSON.stringify(perfiles, null, 2));

    // Seleccionar perfil
    const primerPerfil = perfiles.profiles[0];
    const response = await UserService.selectUserProfile({ requestBody: { profile_id: primerPerfil.id } });
    console.log('Profile selection response:', response);

    const escenarios = await ScenesService.getScenes();
    const escenarioId = escenarios[0].id;
    const games = await GamesService.getGames({ sceneId: escenarioId });

    console.log('Games:', games);
  } catch (error) {
    console.error('Error:', error, (error as Error).message);
    if ((error as any).response) {
      console.error('Response data:', (error as any).response.data);
    }
  }
}

// Suscribirse a cambios en la autenticación
supabase.auth.onAuthStateChange((event, session): void => {
  console.log('Cambio de sesión:', event);
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    updateAPIAuthHeaders(session);
  }
});

// Ejecutar el programa
main().catch(console.error);