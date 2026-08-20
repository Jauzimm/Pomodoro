import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Combina classes Tailwind com resolução de conflitos (clsx + twMerge). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}