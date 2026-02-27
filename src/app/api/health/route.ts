import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      }
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Health check failed' }, { status: 500 });
  }
}
