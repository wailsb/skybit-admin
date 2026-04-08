import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AuthResponse } from '@/app/Types';
import { Database } from '@/config/db';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { ObjectId } from 'mongodb';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const refreshTokenCookie = cookieStore.get('refresh_token');

    if (!refreshTokenCookie?.value) {
      return NextResponse.json<AuthResponse>({ message: 'No refresh token provided', errorNumber: 1 }, { status: 401 });
    }

    const oldRefreshToken = refreshTokenCookie.value;
    
    // 1. Verify token signature and expiration
    const payload = await verifyRefreshToken(oldRefreshToken);
    
    if (!payload?.userId) {
      return NextResponse.json<AuthResponse>({ message: 'Invalid refresh token', errorNumber: 1 }, { status: 401 });
    }

    const db = Database.getInstance().getClient();
    await db.connect();
    
    const collection = db.db('skybit').collection('users');
    const user = await collection.findOne({ _id: new ObjectId(payload.userId) });

    // 2. Verify token matches the one in DB (detects logged out tokens or token reuse)
    if (!user || user.refreshToken !== oldRefreshToken) {
      return NextResponse.json<AuthResponse>({ message: 'Refresh token invalid or revoked', errorNumber: 1 }, { status: 401 });
    }

    // 3. Token Rotation (Generate new pair)
    const newAccessToken = await generateAccessToken({ userId: user._id.toString(), email: user.email, role: user.role });
    const newRefreshToken = await generateRefreshToken({ userId: user._id.toString() });

    // 4. Update DB
    await collection.updateOne({ _id: user._id }, { $set: { refreshToken: newRefreshToken } });

    // 5. Update Cookie
    cookieStore.set('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return NextResponse.json<AuthResponse>({
      message: 'Token refreshed successfully',
      errorNumber: 0,
      token: newAccessToken
    }, { status: 200 });

  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json<AuthResponse>({ message: 'Internal server error', errorNumber: 500 }, { status: 500 });
  }
}
