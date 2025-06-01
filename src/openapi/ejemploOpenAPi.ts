/**
 * A este juego le faltaria la logica del login para obtener las cookies, ya que en un futuro para generar el juego si o si se van a necesitar
 */
import { OpenAPI, Game, GamesService } from './api-fonoaudiologia';

// Configurar la URL base de la API y habilitar el envío de cookies
OpenAPI.BASE = 'http://localhost:8000/api/v1';
OpenAPI.WITH_CREDENTIALS = true; // Necesario para que se envien las cookies en los requests

async function obtenerJuegos(): Promise<void> {
  try {
    // Llamar al endpoint para obtener juegos
    // Reemplaza '123' con el ID del escenario que quieras probar
    const response = await GamesService.getGames({ sceneId: '123' });

    console.log('Respuesta:', response);

    // Acceder a los datos de los juegos
    if (response.status === 'ok' && response.games_data) {
      response.games_data.forEach((game: Game, index: number) => {
        console.log(`\nJuego ${index + 1}:`);
        console.log('URL del video:', game.videoUrl);
        console.log('Objetos:', game.objects);
      });
    }
  } catch (error) {
    console.error('Error al obtener los juegos:', error);
  }
}

// Ejecutar la función
obtenerJuegos();