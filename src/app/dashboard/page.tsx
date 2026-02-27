'use client';

import { useEffect, useState } from 'react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { Task } from '@/types';

interface DashboardResponse {
  total: number;
  completed: number;
  overdue: number;
  byPriority: { low: number; medium: number; high: number };
  upcomingDue: Task[];
}

export function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Please sign in to view your dashboard.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          const message = await response.json().catch(() => ({ error: 'Unable to load dashboard.' }));
          throw new Error(message.error || 'Unable to load dashboard.');
        }
        const payload: DashboardResponse = await response.json();
        setData(payload);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load dashboard.';
        setError(message);
        toast(message, 'error');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchDashboard();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, toast]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-error">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-secondary">No dashboard data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent>
            <p className="text-sm text-secondary">Total tasks</p>
            <p className="text-2xl font-semibold">{data.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-secondary">Completed</p>
            <p className="text-2xl font-semibold">{data.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-secondary">Overdue</p>
            <p className="text-2xl font-semibold">{data.overdue}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-secondary">High priority</p>
            <p className="text-2xl font-semibold">{data.byPriority.high}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Tasks by priority</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Low</span>
              <Badge variant="secondary">{data.byPriority.low}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Medium</span>
              <Badge variant="warning">{data.byPriority.medium}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">High</span>
              <Badge variant="error">{data.byPriority.high}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Upcoming due</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.upcomingDue.length === 0 ? (
              <p className="text-sm text-secondary">No upcoming tasks due.</p>
            ) : (
              data.upcomingDue.map((task) => (
                <div key={task.id} className="flex flex-col gap-1 rounded-md border border-border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{task.title}</p>
                    <Badge variant={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'secondary'}>
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-secondary">
                    Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default DashboardPage;
