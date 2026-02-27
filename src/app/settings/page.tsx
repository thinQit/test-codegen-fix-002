'use client';

import { useEffect, useState } from 'react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { useToast } from '@/providers/ToastProvider';
import { User } from '@/types';

interface ProfileResponse {
  user: User;
}

export function SettingsPage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please sign in to view settings.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          const message = await response.json().catch(() => ({ error: 'Unable to load profile.' }));
          throw new Error(message.error || 'Unable to load profile.');
        }
        const payload: ProfileResponse = await response.json();
        setProfile(payload.user);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load profile.';
        setError(message);
        toast(message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

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

  if (!profile) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-secondary">No profile data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Account settings</h1>
          <p className="text-sm text-secondary">Review your profile details.</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Name" value={profile.name} disabled />
            <Input label="Email" value={profile.email} disabled />
            <Input label="Role" value={profile.role} disabled />
            <Input
              label="Member since"
              value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
              disabled
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Password</h2>
          <p className="text-sm text-secondary">Password updates will be available soon.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input label="Current password" type="password" value="" disabled />
          <Input label="New password" type="password" value="" disabled />
          <Button variant="outline" disabled>
            Update password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default SettingsPage;
