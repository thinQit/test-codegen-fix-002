import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
}

export function Spinner({ className }: SpinnerProps) {
  return (
    <div
      className={cn('h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary', className)}
      role="status"
      aria-label="Loading"
    />
  );
}

export default Spinner;
