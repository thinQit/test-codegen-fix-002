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

    const user = await db.user.findUnique({ where: { id: userId } });
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
