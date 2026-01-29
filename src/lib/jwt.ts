import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';
const JWT_ACCESS_EXPIRES_IN = '15m'; // 15分钟
const JWT_REFRESH_EXPIRES_IN = '7d'; // 7天

export interface JWTPayload {
  userId: string;
  sessionId: string;
  role: string;
  shardId: number;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  refreshTokenExpiresAt: Date;
}

/**
 * 生成访问令牌
 */
export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_ACCESS_EXPIRES_IN });
}

/**
 * 生成刷新令牌
 */
export function generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
}

/**
 * 生成令牌对
 */
export function generateTokenPair(payload: Omit<JWTPayload, 'iat' | 'exp'>): TokenPair {
  const now = new Date();
  const accessExpiresInMinutes = 15;
  const refreshExpiresInDays = 7;

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const expiresAt = new Date(now.getTime() + accessExpiresInMinutes * 60 * 1000);
  const refreshTokenExpiresAt = new Date(now.getTime() + refreshExpiresInDays * 24 * 60 * 60 * 1000);

  return {
    accessToken,
    refreshToken,
    expiresAt,
    refreshTokenExpiresAt,
  };
}

/**
 * 验证访问令牌
 */
export function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
}

/**
 * 验证刷新令牌
 */
export function verifyRefreshToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * 从请求头中提取令牌
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
