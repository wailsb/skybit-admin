import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-development-only-change-in-prod'
);

const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'fallback-refresh-development-only-change-in-prod'
);

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

// ----------------------------------------------------------------------
// Token Generation
// ----------------------------------------------------------------------
/**
 * Generates an Access Token with a short lifespan (e.g. 15 minutes)
 */
export async function generateAccessToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(JWT_SECRET);
}

/**
 * Generates a Refresh Token with a long lifespan (e.g. 7 days)
 */
export async function generateRefreshToken(payload: Pick<TokenPayload, 'userId'>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(REFRESH_SECRET);
}

// ----------------------------------------------------------------------
// Token Verification
// ----------------------------------------------------------------------
export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return payload as unknown as { userId: string };
  } catch {
    return null;
  }
}
