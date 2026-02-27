import { NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { getTokenFromHeader, verifyAccessToken } from '@/lib/auth';

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'archived']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().datetime().optional(),
  tags: z.array(z.string()).optional()
});

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

    const task = await db.task.findUnique({ where: { id: params.id } });
    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    if (task.ownerId !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: { task: { ...task, tags: JSON.parse(task.tags || '[]') } }
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch task' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const task = await db.task.findUnique({ where: { id: params.id } });
    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    if (task.ownerId !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message || 'Invalid payload' }, { status: 400 });
    }

    const completedAt = parsed.data.status === 'completed' ? new Date() : parsed.data.status ? null : task.completedAt;

    const updated = await db.task.update({
      where: { id: params.id },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        status: parsed.data.status,
        priority: parsed.data.priority,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
        tags: parsed.data.tags ? JSON.stringify(parsed.data.tags) : undefined,
        completedAt
      }
    });

    return NextResponse.json({
      success: true,
      data: { task: { ...updated, tags: JSON.parse(updated.tags || '[]') } }
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const task = await db.task.findUnique({ where: { id: params.id } });
    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    if (task.ownerId !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await db.task.delete({ where: { id: params.id } });

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete task' }, { status: 500 });
  }
}
