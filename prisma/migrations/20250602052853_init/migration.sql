-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MEDICO', 'PACIENTE');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "Role" NOT NULL,
    "medicoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Perfil" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "avatarUrl" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Perfil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notificacion" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leido" BOOLEAN NOT NULL DEFAULT false,
    "perfilId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgresoEscenario" (
    "id" TEXT NOT NULL,
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "objetosTotales" INTEGER NOT NULL,
    "objetosReconocidos" INTEGER NOT NULL,
    "escenarioId" TEXT NOT NULL,
    "perfilId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgresoEscenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Escenario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "imagenUrl" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Escenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObjetoEscenario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "coordenadas" JSONB NOT NULL,
    "imagenUrl" TEXT NOT NULL,
    "videoSenaUrl" TEXT NOT NULL,
    "escenarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ObjetoEscenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Juego" (
    "id" TEXT NOT NULL,
    "objetoCorrectoId" TEXT NOT NULL,
    "objetoSeleccionadoId" TEXT,
    "sesionJuegoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Juego_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JuegoOpcion" (
    "id" TEXT NOT NULL,
    "juegoId" TEXT NOT NULL,
    "objetoEscenarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JuegoOpcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SesionJuego" (
    "id" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3),
    "juegosTotales" INTEGER NOT NULL,
    "aciertos" INTEGER NOT NULL,
    "errores" INTEGER NOT NULL,
    "perfilId" TEXT NOT NULL,
    "escenarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SesionJuego_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_rol_idx" ON "Usuario"("rol");

-- CreateIndex
CREATE INDEX "Usuario_medicoId_idx" ON "Usuario"("medicoId");

-- CreateIndex
CREATE INDEX "Perfil_usuarioId_idx" ON "Perfil"("usuarioId");

-- CreateIndex
CREATE INDEX "Notificacion_perfilId_idx" ON "Notificacion"("perfilId");

-- CreateIndex
CREATE INDEX "Notificacion_leido_idx" ON "Notificacion"("leido");

-- CreateIndex
CREATE INDEX "Notificacion_createdAt_idx" ON "Notificacion"("createdAt");

-- CreateIndex
CREATE INDEX "ProgresoEscenario_perfilId_idx" ON "ProgresoEscenario"("perfilId");

-- CreateIndex
CREATE INDEX "ProgresoEscenario_escenarioId_idx" ON "ProgresoEscenario"("escenarioId");

-- CreateIndex
CREATE INDEX "ObjetoEscenario_escenarioId_idx" ON "ObjetoEscenario"("escenarioId");

-- CreateIndex
CREATE INDEX "Juego_sesionJuegoId_idx" ON "Juego"("sesionJuegoId");

-- CreateIndex
CREATE INDEX "Juego_objetoCorrectoId_idx" ON "Juego"("objetoCorrectoId");

-- CreateIndex
CREATE INDEX "Juego_objetoSeleccionadoId_idx" ON "Juego"("objetoSeleccionadoId");

-- CreateIndex
CREATE INDEX "SesionJuego_perfilId_idx" ON "SesionJuego"("perfilId");

-- CreateIndex
CREATE INDEX "SesionJuego_escenarioId_idx" ON "SesionJuego"("escenarioId");

-- CreateIndex
CREATE INDEX "SesionJuego_createdAt_idx" ON "SesionJuego"("createdAt");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Perfil" ADD CONSTRAINT "Perfil_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "Perfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgresoEscenario" ADD CONSTRAINT "ProgresoEscenario_escenarioId_fkey" FOREIGN KEY ("escenarioId") REFERENCES "Escenario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgresoEscenario" ADD CONSTRAINT "ProgresoEscenario_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "Perfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObjetoEscenario" ADD CONSTRAINT "ObjetoEscenario_escenarioId_fkey" FOREIGN KEY ("escenarioId") REFERENCES "Escenario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Juego" ADD CONSTRAINT "Juego_objetoCorrectoId_fkey" FOREIGN KEY ("objetoCorrectoId") REFERENCES "ObjetoEscenario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Juego" ADD CONSTRAINT "Juego_objetoSeleccionadoId_fkey" FOREIGN KEY ("objetoSeleccionadoId") REFERENCES "ObjetoEscenario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Juego" ADD CONSTRAINT "Juego_sesionJuegoId_fkey" FOREIGN KEY ("sesionJuegoId") REFERENCES "SesionJuego"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JuegoOpcion" ADD CONSTRAINT "JuegoOpcion_juegoId_fkey" FOREIGN KEY ("juegoId") REFERENCES "Juego"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JuegoOpcion" ADD CONSTRAINT "JuegoOpcion_objetoEscenarioId_fkey" FOREIGN KEY ("objetoEscenarioId") REFERENCES "ObjetoEscenario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SesionJuego" ADD CONSTRAINT "SesionJuego_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "Perfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SesionJuego" ADD CONSTRAINT "SesionJuego_escenarioId_fkey" FOREIGN KEY ("escenarioId") REFERENCES "Escenario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
