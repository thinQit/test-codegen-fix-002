import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return <div className={cn('rounded-lg border border-border bg-background shadow-sm', className)}>{children}</div>;
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={cn('border-b border-border px-4 py-3', className)}>{children}</div>;
}

export function CardContent({ children, className }: CardProps) {
  return <div className={cn('px-4 py-4', className)}>{children}</div>;
}

export function CardFooter({ children, className }: CardProps) {
  return <div className={cn('border-t border-border px-4 py-3', className)}>{children}</div>;
}

export default Card;
