
const allowedUsers: { [key: string]: string } = {
  'prueba1': '123456',
};

// TODO: add database
export async function verifyUser(username: string, userPassword: string): Promise<boolean> {
  return allowedUsers[username] === userPassword;
}