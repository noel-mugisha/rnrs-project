import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { JWTPayload, RefreshTokenPayload } from '@/types';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'default-secret';
const REFRESH_SECRET: Secret = process.env.REFRESH_TOKEN_SECRET || 'default-refresh';

const ACCESS_EXPIRES_IN: SignOptions['expiresIn'] = (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '15m';
const REFRESH_EXPIRES_IN: SignOptions['expiresIn'] = (process.env.REFRESH_TOKEN_EXPIRES_IN as SignOptions['expiresIn']) || '7d';

export const hashPassword = async (password: string): Promise<string> => {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
  return bcrypt.hash(password, rounds);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// --- JWT Access & Refresh Tokens ---
export const generateAccessToken = (payload: JWTPayload): string =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRES_IN });

export const generateRefreshToken = (payload: RefreshTokenPayload): string =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });

export const verifyAccessToken = (token: string): JWTPayload =>
  jwt.verify(token, JWT_SECRET) as JWTPayload;

export const verifyRefreshToken = (token: string): RefreshTokenPayload =>
  jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;


export const generateOTP = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const hashOTP = (otp: string): string =>
  crypto.createHash('sha256').update(otp).digest('hex');


export const generateTokenHash = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

export const generateSecureToken = (): string =>
  crypto.randomBytes(32).toString('hex');
