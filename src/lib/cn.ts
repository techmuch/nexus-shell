import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind class names, resolving conflicts so the last-specified
 * utility wins. Use this anywhere a component accepts a `className` prop
 * that should be able to override the component's own defaults.
 *
 * @example
 * cn('px-2 text-sm', isActive && 'text-primary', className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export type { ClassValue };
