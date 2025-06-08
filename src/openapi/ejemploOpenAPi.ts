/**
 * A este juego le faltaria la logica del login para obtener las cookies, ya que en un futuro para generar el juego si o si se van a necesitar
 */
import { OpenAPI, UserService } from './api-fonoaudiologia';
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

    //updateAuthHeaders(signInData.data.session);


    // Hacer la llamada a la API
    const perfiles = await UserService.getUserGetProfiles();
    console.log('Perfiles obtenidos:', JSON.stringify(perfiles, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

// Ejecutar la función
main().catch(console.error);