const PORT = Number(process.env.PORT);

const secretKey = process.env.SECRET_KEY as string;
if (!secretKey) {
  throw new Error('env file did not provide secret key');
}

const gamesSecret = process.env.GAMES_SECRET_KEY as string;
if (!gamesSecret) {
  throw new Error('env file did not provide the game secret key');
}

export { secretKey, PORT, gamesSecret };