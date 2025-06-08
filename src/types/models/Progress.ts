export interface ProgresedScene {
  id: string,
  name: string,
}

export interface GameSession {
  intento: number,
  aciertos: number,
  totalPreguntas: number,
  tiempoCompletado: number,
}