import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { query } from '@/lib/database/connection';
import { findByUsername, verifyPassword } from '@/lib/database/models/user';
import { getConfig } from '@/lib/config';

export interface TokenPayload {
  userId: number;
  username: string;
  email: string;
  name: string;
}

export async function createToken(payload: TokenPayload): Promise<string> {
  const config = getConfig();
  const jwtSecret = new TextEncoder().encode(config.security.jwtSecret);
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${config.security.jwtExpireDays}d`)
    .sign(jwtSecret);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  const config = getConfig();
  const jwtSecret = new TextEncoder().encode(config.security.jwtSecret);
  try {
    const { payload } = await jwtVerify(token, jwtSecret);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function login(username: string, password: string): Promise<string | null> {
  const user = await findByUsername(username);
  if (!user) return null;

  if (user.status !== 1) return null;

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) return null;

  const config = getConfig();
  const token = await createToken({
    userId: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
  });

  await query(
    'INSERT INTO pioc_sessions (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))',
    [user.id, token, config.security.jwtExpireDays]
  );

  return token;
}

export async function logout(token: string): Promise<void> {
  await query('DELETE FROM pioc_sessions WHERE token = ?', [token]);
}

export async function getSession(): Promise<TokenPayload | null> {
  const config = getConfig();
  const cookieStore = await cookies();
  const token = cookieStore.get(config.security.sessionCookieName)?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  const sessions = await query<{ token: string }[]>(
    'SELECT token FROM pioc_sessions WHERE user_id = ? AND expires_at > NOW()',
    [payload.userId]
  );

  const tokenExists = sessions.some(s => s.token === token);
  if (!tokenExists) return null;

  return payload;
}

export async function setSessionCookie(token: string): Promise<void> {
  const config = getConfig();
  const cookieStore = await cookies();
  cookieStore.set(config.security.sessionCookieName, token, {
    httpOnly: true,
    secure: config.security.httpsEnabled,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * config.security.jwtExpireDays,
    path: '/',
  });
}

export async function clearSessionCookie(): Promise<void> {
  const config = getConfig();
  const cookieStore = await cookies();
  cookieStore.delete(config.security.sessionCookieName);
}
