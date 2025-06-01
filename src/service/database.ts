import { Role } from '@prisma/client';
import { prisma } from '../lib/prisma';

export async function verifyUser(username: string, userPassword: string): Promise<{ name: string; id: string; email: string; password: string; rol: Role; medicoId: string | null; createdAt: Date; updatedAt: Date; } | null> {
  const userData = await prisma.usuario.findFirst({
    where: {
      name: username,
      password: userPassword, // TODO: encrypt
    },
  });

  return userData;
}