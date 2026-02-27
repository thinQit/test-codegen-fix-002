import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@/lib/auth';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hashPassword('Password123');

  const alice = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      passwordHash
    }
  });

  const bob = await prisma.user.create({
    data: {
      name: 'Bob Smith',
      email: 'bob@example.com',
      passwordHash
    }
  });

  await prisma.task.create({
    data: {
      title: 'Prepare onboarding docs',
      description: 'Create onboarding checklist and share with team',
      status: 'in_progress',
      priority: 'high',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      tags: JSON.stringify(['onboarding', 'docs']),
      ownerId: alice.id
    }
  });

  await prisma.task.create({
    data: {
      title: 'Weekly planning',
      description: 'Plan tasks for next week',
      status: 'pending',
      priority: 'medium',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
      tags: JSON.stringify(['planning']),
      ownerId: alice.id
    }
  });

  await prisma.task.create({
    data: {
      title: 'Invoice reconciliation',
      description: 'Review and reconcile invoices',
      status: 'completed',
      priority: 'low',
      completedAt: new Date(),
      tags: JSON.stringify(['finance']),
      ownerId: bob.id
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
