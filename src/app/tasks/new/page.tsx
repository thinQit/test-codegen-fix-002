'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/providers/ToastProvider';
import { TaskPriority } from '@/types';

export function NewTaskPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please sign in to create a task.');
      setLoading(false);
      return;
    }

    const payload = {
      title,
      description: description || undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      priority,
      tags: tags ? tags.split(',').map((tag) => tag.trim()).filter(Boolean) : undefined
    };

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const message = await response.json().catch(() => ({ error: 'Unable to create task.' }));
        throw new Error(message.error || 'Unable to create task.');
      }

      toast('Task created successfully!', 'success');
      router.push('/tasks');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to create task.';
      setError(message);
      toast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Create a new task</h1>
          <p className="text-sm text-secondary">Add details and track your progress.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
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
              <Input
                label="Due date"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
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
            <Input
              label="Tags"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              helperText="Separate tags with commas (e.g. design, sprint)."
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" loading={loading}>
                Create task
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/tasks')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default NewTaskPage;
