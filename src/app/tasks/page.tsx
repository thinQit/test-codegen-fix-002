'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/providers/ToastProvider';
import { Task, TaskPriority, TaskStatus } from '@/types';

interface TaskListResponse {
  items: Task[];
  total: number;
  page: number;
  pageSize: number;
}

export function TasksPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState<TaskStatus | ''>('');
  const [priority, setPriority] = useState<TaskPriority | ''>('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [tagFilter, setTagFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil((tasks.length ? tasks.length : 1) / pageSize)), [tasks, pageSize]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');

    if (!token) {
      setError('Please sign in to view your tasks.');
      setLoading(false);
      return;
    }

    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      sortBy,
      sortOrder
    });

    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    if (tagFilter) params.append('tags', tagFilter);

    try {
      const response = await fetch(`/api/tasks?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        const message = await response.json().catch(() => ({ error: 'Unable to load tasks.' }));
        throw new Error(message.error || 'Unable to load tasks.');
      }
      const payload: TaskListResponse = await response.json();
      setTasks(payload.items);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load tasks.';
      setError(message);
      toast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, priority, sortBy, sortOrder, status, tagFilter, toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleToggleStatus = async (task: Task) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const nextStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (!response.ok) {
        const message = await response.json().catch(() => ({ error: 'Unable to update task.' }));
        throw new Error(message.error || 'Unable to update task.');
      }
      const payload = await response.json();
      setTasks((prev) => prev.map((item) => (item.id === task.id ? payload.task : item)));
      toast('Task updated.', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update task.';
      toast(message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/tasks/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        const message = await response.json().catch(() => ({ error: 'Unable to delete task.' }));
        throw new Error(message.error || 'Unable to delete task.');
      }
      setTasks((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      toast('Task deleted.', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to delete task.';
      toast(message, 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

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

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold">Your tasks</h1>
              <p className="text-sm text-secondary">Filter, sort, and manage your task list.</p>
            </div>
            <Link href="/tasks/new">
              <Button>New task</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Status</label>
              <select
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
                value={status}
                onChange={(event) => setStatus(event.target.value as TaskStatus | '')}
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Priority</label>
              <select
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
                value={priority}
                onChange={(event) => setPriority(event.target.value as TaskPriority | '')}
              >
                <option value="">All</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Sort by</label>
              <select
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="dueDate">Due date</option>
                <option value="createdAt">Created date</option>
                <option value="priority">Priority</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Tags</label>
              <input
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
                placeholder="e.g. design, sprint"
                value={tagFilter}
                onChange={(event) => setTagFilter(event.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={fetchTasks}>
              Apply filters
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setStatus('');
                setPriority('');
                setSortBy('dueDate');
                setSortOrder('asc');
                setTagFilter('');
              }}
            >
              Reset
            </Button>
            <Button
              variant="ghost"
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            >
              Sort: {sortOrder.toUpperCase()}
            </Button>
          </div>
        </CardContent>
      </Card>

      {tasks.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-sm text-secondary">No tasks found. Create a new task to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <Card key={task.id}>
              <CardContent>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold">{task.title}</h3>
                      <Badge
                        variant={
                          task.status === 'completed'
                            ? 'success'
                            : task.status === 'in_progress'
                            ? 'warning'
                            : 'secondary'
                        }
                      >
                        {task.status.replace('_', ' ')}
                      </Badge>
                      <Badge
                        variant={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'secondary'}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    {task.description && <p className="text-sm text-secondary">{task.description}</p>}
                    <div className="flex flex-wrap gap-2 text-xs text-secondary">
                      <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</span>
                      <span>Created: {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {task.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => handleToggleStatus(task)}>
                      {task.status === 'completed' ? 'Mark pending' : 'Mark complete'}
                    </Button>
                    <Link href={`/tasks/${task.id}`}>
                      <Button variant="ghost">View</Button>
                    </Link>
                    <Button variant="destructive" onClick={() => setDeleteTarget(task)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-secondary">
          <span>Page {page}</span>
          <select
            className="rounded-md border border-border px-2 py-1 text-sm"
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value))}
          >
            {[5, 10, 20].map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
            Previous
          </Button>
          <Button variant="outline" onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}>
            Next
          </Button>
        </div>
      </div>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete task"
      >
        <p className="text-sm text-secondary">Are you sure you want to delete this task?</p>
        <div className="mt-4 flex gap-2">
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default TasksPage;
