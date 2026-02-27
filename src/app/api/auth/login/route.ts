import { NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { verifyPassword, signAccessToken, signRefreshToken } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message || 'Invalid payload' }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    await db.authSession.create({
      data: {
        token: accessToken,
        refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt, updatedAt: user.updatedAt },
        accessToken,
        refreshToken
      }
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 });
  }
}
