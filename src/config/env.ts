const PORT = Number(process.env.PORT);

const secretKey = process.env.SECRET_KEY as string;
if (!secretKey) {
  throw new Error('Env file did not provide secret key');
}

export { secretKey, PORT };