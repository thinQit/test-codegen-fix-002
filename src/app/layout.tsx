import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/layout/Navigation';
import AuthProvider from '@/providers/AuthProvider';
import ToastProvider from '@/providers/ToastProvider';
import Toaster from '@/components/ui/Toaster';

export const metadata: Metadata = {
  title: 'Task Manager',
  description: 'A web-based Task Manager with authentication, task CRUD, and dashboard metrics.'
};

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <AuthProvider>
          <ToastProvider>
            <div className="flex min-h-screen flex-col">
              <Navigation />
              <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
            </div>
            <Toaster />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

export default RootLayout;
