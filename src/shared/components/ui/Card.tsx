import type { HTMLAttributes } from 'react';

import { cn } from '../../utils/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-zinc-200/80 bg-white shadow-sm shadow-zinc-200/40 transition-colors dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/20',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-between gap-3 p-4 pb-2', className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200', className)}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-4 pt-2', className)} {...props} />;
}