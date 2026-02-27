import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromHeader, verifyAccessToken } from '@/lib/auth';

export const runtime = 'nodejs';

const protectedPaths = ['/api/tasks', '/api/dashboard', '/api/users/me', '/api/auth/me', '/api/users', '/api/authsessions'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!protectedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = getTokenFromHeader(request.headers.get('authorization'));
  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    verifyAccessToken(token);
    return NextResponse.next();
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/:path*']
};
