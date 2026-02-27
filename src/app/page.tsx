import Link from 'next/link';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <section className="rounded-2xl border border-border bg-muted p-8 text-center">
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Stay on top of every task</h1>
        <p className="mt-3 text-base text-secondary sm:text-lg">
          Organize, prioritize, and track your work with a focused task manager built for productivity.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard" aria-label="Go to dashboard">
            <Button>View Dashboard</Button>
          </Link>
          <Link href="/tasks" aria-label="Go to tasks">
            <Button variant="outline">Manage Tasks</Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Task metrics at a glance</h2>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-secondary">
              Monitor completed, overdue, and upcoming work with an easy-to-read dashboard designed for quick check-ins.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Flexible filters</h2>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-secondary">
              Sort by priority, status, or due date. Use quick actions to keep work moving forward without opening each task.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default HomePage;
