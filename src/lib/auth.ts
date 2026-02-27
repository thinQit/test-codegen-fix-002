import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface AuthTokenPayload {
  sub: string;
  jti: string;
  exp?: number;
  iat?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret';
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signAccessToken(userId: string) {
  const payload: AuthTokenPayload = { sub: userId, jti: crypto.randomUUID() };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function signRefreshToken(userId: string) {
  const payload: AuthTokenPayload = { sub: userId, jti: crypto.randomUUID() };
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
}

export function getTokenFromHeader(authorization?: string | null) {
  if (!authorization) return null;
  const [type, token] = authorization.split(' ');
  if (type !== 'Bearer' || !token) return null;
  return token;
}
