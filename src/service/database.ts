
const allowedUsers: { [key: string]: string } = {
  'stefano': '1234',
};

// TODO: add database
export async function verifyUser(username: string, userPassword: string): Promise<boolean> {
  return allowedUsers[username] === userPassword;
}