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

    const now = new Date();

    const [total, completed, overdue, low, medium, high, upcoming] = await Promise.all([
      db.task.count({ where: { ownerId: userId } }),
      db.task.count({ where: { ownerId: userId, status: 'completed' } }),
      db.task.count({
        where: {
          ownerId: userId,
          dueDate: { lt: now },
          status: { not: 'completed' }
        }
      }),
      db.task.count({ where: { ownerId: userId, priority: 'low' } }),
      db.task.count({ where: { ownerId: userId, priority: 'medium' } }),
      db.task.count({ where: { ownerId: userId, priority: 'high' } }),
      db.task.findMany({
        where: { ownerId: userId, dueDate: { gte: now } },
        orderBy: { dueDate: 'asc' },
        take: 5
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        total,
        completed,
        overdue,
        byPriority: { low, medium, high },
        upcomingDue: upcoming.map((task) => ({
          ...task,
          tags: JSON.parse(task.tags || '[]')
        }))
      }
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch dashboard' }, { status: 500 });
  }
}
