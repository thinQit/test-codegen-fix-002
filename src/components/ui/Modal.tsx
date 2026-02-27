'use client';

import { ReactNode, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    if (open) {
      window.addEventListener('keydown', handler);
    }
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        className="fixed inset-0 bg-black/40"
        aria-label="Close modal"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn('relative z-10 w-full max-w-lg rounded-lg bg-background p-6 shadow-lg', className)}
      >
        <div className="flex items-center justify-between">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          <button
            className="rounded-md border border-border px-2 py-1 text-sm"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
