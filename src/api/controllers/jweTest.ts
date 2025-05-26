import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js';

const secretJWT = 'mi-clave-secreta-del-jwt';
const secretPayload = 'mi-clave-de-encriptacion';

const payload = {
  userId: 123,
  email: 'usuario@ejemplo.com',
};

// Encriptar el payload
// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
const encryptedPayload = CryptoJS.AES.encrypt(JSON.stringify(payload), secretPayload).toString() as string;

// Crear el JWT con el payload encriptado como una cadena
const token = jwt.sign({ data: encryptedPayload }, secretJWT, { expiresIn: '1h' });

console.log('JWT generado:', token);

// 🧾 Para desencriptar el payload después de verificar el token:
const decoded = jwt.verify(token + 'asdlfalskj', secretJWT) as { data: string };
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
const decryptedBytes = CryptoJS.AES.decrypt(decoded.data, secretPayload);
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
const decryptedPayload = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));

console.log('Payload desencriptado:', decryptedPayload);
