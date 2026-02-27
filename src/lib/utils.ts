import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | number | Date) {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
}

export default cn;
