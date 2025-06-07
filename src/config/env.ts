const PORT = Number(process.env.PORT);
const secretKey = process.env.SECRET_KEY as string;
if (!secretKey) {
  throw new Error('env file did not provide secret key');
}

const gamesSecret = process.env.GAMES_SECRET_KEY as string;
if (!gamesSecret) {
  throw new Error('env file did not provide the game secret key');
}

const SUPABASE_URL = process.env.SUPABASE_URL as string;
if (!SUPABASE_URL) {
  throw new Error('env file did not provide Supabase URL');
}

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('env file did not provide Supabase service key');
}

export { secretKey, PORT, gamesSecret, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL };