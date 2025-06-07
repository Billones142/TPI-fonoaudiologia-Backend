import { Role } from '@prisma/client';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

async function encryptPasswordForDB(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export async function verifyUser(email: string, userPassword: string): Promise<{ name: string; id: string; email: string; password: string; rol: Role; medicoId: string | null; createdAt: Date; updatedAt: Date; } | null> {
  const emailRegEx = /^[^.\s][\w-]+(\.[\w-]+)*@([\w-]+\.)+[\w-]{2,}$/gm;
  if (!emailRegEx.test(email)) {
    throw new Error('Email is not valid');
  }

  const userData = await prisma.usuario.findFirst({
    where: {
      email: email,
    },
    include: {
      pacientes: true,
    },
  });

  if (!userData) {
    return null;
  }

  const isPasswordValid = await comparePasswords(userPassword, userData.password);
  if (!isPasswordValid) {
    return null;
  }

  return userData;
}