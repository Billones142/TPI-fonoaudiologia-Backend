-- DropForeignKey
ALTER TABLE "Juego" DROP CONSTRAINT "Juego_objetoSeleccionadoId_fkey";

-- AlterTable
ALTER TABLE "Juego" ALTER COLUMN "objetoSeleccionadoId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SesionJuego" ALTER COLUMN "fin" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Juego" ADD CONSTRAINT "Juego_objetoSeleccionadoId_fkey" FOREIGN KEY ("objetoSeleccionadoId") REFERENCES "ObjetoEscenario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
