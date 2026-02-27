import { NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { getTokenFromHeader, verifyAccessToken, hashPassword } from '@/lib/auth';

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8)
});

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

    const users = await db.user.findMany({ where: { id: userId } });

    return NextResponse.json({
      success: true,
      data: users.map((user) => ({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt, updatedAt: user.updatedAt }))
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message || 'Invalid payload' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await db.user.create({
      data: { name: parsed.data.name, email: parsed.data.email, passwordHash }
    });

    return NextResponse.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt, updatedAt: user.updatedAt }
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 });
  }
}
