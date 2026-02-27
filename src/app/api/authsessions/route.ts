import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getTokenFromHeader, verifyAccessToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    const userId = payload.sub as string | undefined;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await db.authSession.findMany({ where: { userId } });

    return NextResponse.json({
      success: true,
      data: sessions.map((session) => ({
        id: session.id,
        token: session.token,
        refreshToken: session.refreshToken,
        userId: session.userId,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt
      }))
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch sessions' }, { status: 500 });
  }
}
