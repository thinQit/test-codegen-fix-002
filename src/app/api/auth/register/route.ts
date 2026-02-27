import { NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { hashPassword, signAccessToken, signRefreshToken } from '@/lib/auth';

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Password must include an uppercase letter')
    .regex(/[a-z]/, 'Password must include a lowercase letter')
    .regex(/[0-9]/, 'Password must include a number')
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message || 'Invalid payload' }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: { name, email, passwordHash }
    });

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
    return NextResponse.json({ success: false, error: 'Registration failed' }, { status: 500 });
  }
}
