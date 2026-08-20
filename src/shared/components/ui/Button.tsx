import { forwardRef, type ButtonHTMLAttributes } from 'react';

import { cn } from '../../utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 active:scale-95',
  secondary:
    'bg-zinc-200 text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 active:scale-95',
  ghost:
    'text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50',
  danger:
    'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 dark:text-rose-400 active:scale-95',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-7 text-base gap-2',
  icon: 'size-10',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center rounded-xl font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-zinc-950',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';