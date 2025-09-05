import * as bcrypt from 'bcryptjs';

export async function hashPassword(
  password: string,
  saltRounds = 10,
): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
