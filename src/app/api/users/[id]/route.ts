import { NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { getTokenFromHeader, verifyAccessToken } from '@/lib/auth';

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional()
});

function getUserIdFromRequest(request: Request) {
  const token = getTokenFromHeader(request.headers.get('authorization'));
  if (!token) return null;
  const payload = verifyAccessToken(token);
  return payload.sub as string | null;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (params.id !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const user = await db.user.findUnique({ where: { id: params.id } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt, updatedAt: user.updatedAt }
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (params.id !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message || 'Invalid payload' }, { status: 400 });
    }

    const user = await db.user.update({
      where: { id: params.id },
      data: parsed.data
    });

    return NextResponse.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt, updatedAt: user.updatedAt }
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (params.id !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await db.user.delete({ where: { id: params.id } });

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete user' }, { status: 500 });
  }
}
