'use client';

import { useToast } from '@/providers/ToastProvider';

export function Toaster() {
  useToast();
  return null;
}

export default Toaster;
