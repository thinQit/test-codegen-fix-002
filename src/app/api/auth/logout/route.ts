import { NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';

const logoutSchema = z.object({
  refreshToken: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = logoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message || 'Invalid payload' }, { status: 400 });
    }

    await db.authSession.deleteMany({ where: { refreshToken: parsed.data.refreshToken } });

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ success: false, error: 'Logout failed' }, { status: 500 });
  }
}
