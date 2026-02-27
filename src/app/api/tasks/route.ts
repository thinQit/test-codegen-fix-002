import { NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { getTokenFromHeader, verifyAccessToken } from '@/lib/auth';

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  tags: z.array(z.string()).optional()
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

    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || 1);
    const pageSize = Number(url.searchParams.get('pageSize') || 10);
    const status = url.searchParams.get('status');
    const priority = url.searchParams.get('priority');
    const dueFrom = url.searchParams.get('dueFrom');
    const dueTo = url.searchParams.get('dueTo');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const tags = url.searchParams.getAll('tags');

    const where: {
      ownerId: string;
      status?: string;
      priority?: string;
      dueDate?: { gte?: Date; lte?: Date };
      tags?: { contains: string };
    } = { ownerId: userId };

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (dueFrom || dueTo) {
      where.dueDate = {};
      if (dueFrom) where.dueDate.gte = new Date(dueFrom);
      if (dueTo) where.dueDate.lte = new Date(dueTo);
    }
    if (tags.length > 0) {
      where.tags = { contains: tags[0] };
    }

    const [items, total] = await Promise.all([
      db.task.findMany({
        where,
        orderBy: { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      db.task.count({ where })
    ]);

    const mapped = items.map((task) => ({
      ...task,
      tags: JSON.parse(task.tags || '[]')
    }));

    return NextResponse.json({
      success: true,
      data: { items: mapped, total, page, pageSize }
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message || 'Invalid payload' }, { status: 400 });
    }

    const task = await db.task.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
        priority: parsed.data.priority || 'medium',
        tags: JSON.stringify(parsed.data.tags || []),
        ownerId: userId
      }
    });

    return NextResponse.json({
      success: true,
      data: { task: { ...task, tags: JSON.parse(task.tags || '[]') } }
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create task' }, { status: 500 });
  }
}
