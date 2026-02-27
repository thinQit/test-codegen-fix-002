'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import Button from '@/components/ui/Button';

interface NavLink {
  href: string;
  label: string;
}

const navLinks: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/tasks', label: 'Tasks' },
  { href: '/tasks/new', label: 'New Task' },
  { href: '/settings', label: 'Settings' }
];

export function Navigation() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-border bg-background">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8" aria-label="Primary">
        <Link href="/" className="text-lg font-semibold" aria-label="Task Manager home">
          Task Manager
        </Link>
        <button
          className="inline-flex items-center justify-center rounded-md border border-border p-2 text-sm sm:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen(prev => !prev)}
        >
          <span className="sr-only">Open menu</span>
          <span className="h-0.5 w-5 bg-foreground" />
          <span className="my-1 h-0.5 w-5 bg-foreground" />
          <span className="h-0.5 w-5 bg-foreground" />
        </button>
        <div className="hidden items-center gap-6 sm:flex">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-foreground hover:text-primary">
              {link.label}
            </Link>
          ))}
          {!loading && !isAuthenticated && (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}
          {!loading && isAuthenticated && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-foreground">{user?.name}</span>
              <Button variant="outline" size="sm" onClick={logout} aria-label="Log out">
                Logout
              </Button>
            </div>
          )}
        </div>
      </nav>
      {open && (
        <div className="border-t border-border bg-background sm:hidden">
          <div className="flex flex-col gap-2 px-4 py-4">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-foreground hover:text-primary" onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            {!loading && !isAuthenticated && (
              <div className="flex flex-col gap-2 pt-2">
                <Link href="/login" onClick={() => setOpen(false)}>
                  <Button variant="ghost" size="sm" fullWidth>Login</Button>
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}>
                  <Button size="sm" fullWidth>Sign up</Button>
                </Link>
              </div>
            )}
            {!loading && isAuthenticated && (
              <div className="flex flex-col gap-2 pt-2">
                <span className="text-sm text-foreground">{user?.name}</span>
                <Button variant="outline" size="sm" onClick={logout} aria-label="Log out" fullWidth>
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navigation;
