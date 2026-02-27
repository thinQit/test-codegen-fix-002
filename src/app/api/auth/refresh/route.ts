import { NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/lib/auth';

const refreshSchema = z.object({
  refreshToken: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = refreshSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message || 'Invalid payload' }, { status: 400 });
    }

    const { refreshToken } = parsed.data;

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid refresh token' }, { status: 401 });
    }

    const session = await db.authSession.findUnique({ where: { refreshToken } });
    if (!session) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 401 });
    }

    const userId = payload.sub as string | undefined;
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Invalid refresh token' }, { status: 401 });
    }

    const newAccessToken = signAccessToken(userId);
    const newRefreshToken = signRefreshToken(userId);

    await db.authSession.update({
      where: { id: session.id },
      data: {
        token: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
      }
    });

    return NextResponse.json({
      success: true,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken }
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Refresh failed' }, { status: 500 });
  }
}
