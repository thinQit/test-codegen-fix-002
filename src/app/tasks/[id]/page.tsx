'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/providers/ToastProvider';
import { Task, TaskPriority, TaskStatus } from '@/types';

interface TaskResponse {
  task: Task;
}

export function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const taskId = params?.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Please sign in to view this task.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          const message = await response.json().catch(() => ({ error: 'Unable to load task.' }));
          throw new Error(message.error || 'Unable to load task.');
        }
        const payload: TaskResponse = await response.json();
        setTask(payload.task);
        setTitle(payload.task.title);
        setDescription(payload.task.description || '');
        setStatus(payload.task.status);
        setPriority(payload.task.priority);
        setDueDate(payload.task.dueDate ? new Date(payload.task.dueDate).toISOString().split('T')[0] : '');
        setTags(payload.task.tags ? payload.task.tags.join(', ') : '');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load task.';
        setError(message);
        toast(message, 'error');
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      fetchTask();
    }
  }, [taskId, toast]);

  const handleSave = async () => {
    if (!task) return;
    setSaving(true);
    const token = localStorage.getItem('token');
    if (!token) return;

    const payload = {
      title,
      description: description || undefined,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      tags: tags ? tags.split(',').map((tag) => tag.trim()).filter(Boolean) : undefined
    };

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const message = await response.json().catch(() => ({ error: 'Unable to update task.' }));
        throw new Error(message.error || 'Unable to update task.');
      }
      const result = await response.json();
      setTask(result.task);
      toast('Task updated successfully.', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update task.';
      toast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        const message = await response.json().catch(() => ({ error: 'Unable to delete task.' }));
        throw new Error(message.error || 'Unable to delete task.');
      }
      toast('Task deleted.', 'success');
      router.push('/tasks');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to delete task.';
      toast(message, 'error');
    } finally {
      setShowDelete(false);
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

  if (!task) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-secondary">Task not found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold">Task details</h1>
              <p className="text-sm text-secondary">Last updated {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : 'N/A'}.</p>
            </div>
            <Badge variant={task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'warning' : 'secondary'}>
              {task.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Description</label>
              <textarea
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Status</label>
                <select
                  className="w-full rounded-md border border-border px-3 py-2 text-sm"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as TaskStatus)}
                >
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
                  onChange={(event) => setPriority(event.target.value as TaskPriority)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Due date"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
              <Input
                label="Tags"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                helperText="Separate tags with commas."
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleSave} loading={saving}>
                Save changes
              </Button>
              <Button variant="outline" onClick={() => router.push('/tasks')}>
                Back to tasks
              </Button>
              <Button variant="destructive" onClick={() => setShowDelete(true)}>
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Delete task">
        <p className="text-sm text-secondary">Are you sure you want to delete this task?</p>
        <div className="mt-4 flex gap-2">
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
          <Button variant="outline" onClick={() => setShowDelete(false)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default TaskDetailPage;
