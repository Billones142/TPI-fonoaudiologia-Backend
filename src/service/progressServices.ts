import { prisma } from '../lib/prisma';
import { GameSession, ProgresedScene } from '../types/models/Progress';


export async function getScenesWithProfileProgress(profileId: string): Promise<ArrayLike<ProgresedScene>> {
  const escenarios = await prisma.escenario.findMany({
    where: {
      progresosEscenarios: {
        some: {
          perfilId: profileId,
        },
      },
    },
  });

  return escenarios.map<ProgresedScene>((escenario) => {
    return {
      id: escenario.id,
      name: escenario.nombre,
    };
  });
}

export async function sesionesDeJuegoEscenario(profileId: string, sceneId: string): Promise<ArrayLike<GameSession>> {
  const sesiones = await prisma.sesionJuego.findMany({
    where: {
      perfilId: profileId,
      escenarioId: sceneId,
    },
    include: {
      juegos: true,
    },
  });

  // Validate if sessions exist
  if (!sesiones || sesiones.length === 0) {
    return [];
  }

  // Validate and filter out invalid sessions
  const sesionesValidas = sesiones.filter(sesion => {
    return sesion.juegos &&
      sesion.juegos.length > 0 &&
      sesion.aciertos !== undefined &&
      sesion.juegosTotales !== undefined;
  });

  const sesionesOrdenadasPorTimepoDeResolucion = sesionesValidas.sort((a, b) => {
    return a.updatedAt.getTime() - b.updatedAt.getTime();
  });

  return sesionesOrdenadasPorTimepoDeResolucion.map<GameSession>((sesionJuego, indiceJuego) => {
    // Sort games by updatedAt in descending order and get the first one (most recent)
    const juegosOrdenados = sesionJuego.juegos.sort((a, b) =>
      b.updatedAt.getTime() - a.updatedAt.getTime(),
    );

    const ultimaRespuesta = juegosOrdenados[0];

    // Validate and calculate completion time
    const tiempoCompletadoSegundos = ultimaRespuesta
      ? Math.floor((ultimaRespuesta.updatedAt.getTime() - sesionJuego.createdAt.getTime()) / 1000)
      : 0;

    // Validate aciertos and total questions
    const aciertos = Math.max(0, Math.min(sesionJuego.aciertos, sesionJuego.juegosTotales));
    const totalPreguntas = Math.max(1, sesionJuego.juegosTotales);

    return {
      aciertos,
      totalPreguntas,
      tiempoCompletado: tiempoCompletadoSegundos,
      intento: indiceJuego + 1,
    };
  });
}