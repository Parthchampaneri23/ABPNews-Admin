import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'abpnews_super_secret_jwt_key_2026';

export interface UserPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

export function signToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch (error) {
    return null;
  }
}
