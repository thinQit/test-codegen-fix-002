import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getTokenFromHeader, verifyAccessToken } from '@/lib/auth';

function getUserId(request: Request) {
  const token = getTokenFromHeader(request.headers.get('authorization'));
  if (!token) return null;
  const payload = verifyAccessToken(token);
  return payload.sub as string | null;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const session = await db.authSession.findUnique({ where: { id: params.id } });
    if (!session) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    if (session.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: session
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch session' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const session = await db.authSession.findUnique({ where: { id: params.id } });
    if (!session) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    if (session.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await db.authSession.delete({ where: { id: params.id } });

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete session' }, { status: 500 });
  }
}
