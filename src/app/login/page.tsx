'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { User } from '@/types';

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await api.post<LoginResponse>('/api/auth/login', { email, password });

    if (response.error || !response.data) {
      setError(response.error || 'Unable to login.');
      setLoading(false);
      return;
    }

    localStorage.setItem('token', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    login(response.data.user);
    toast('Welcome back!', 'success');
    router.push('/dashboard');
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Sign in</h1>
          <p className="text-sm text-secondary">Use your email and password to access your tasks.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" loading={loading} fullWidth>
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="text-center text-sm text-secondary">
        New here?{' '}
        <Link href="/register" className="font-medium text-primary">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;
