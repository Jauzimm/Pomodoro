import type { ReactNode } from 'react';

import { cn } from '../../../shared/utils/cn';

interface CircularProgressProps {
  /** Progresso de 0 a 1 (fração consumida do tempo). */
  progress: number;
  size?: number;
  strokeWidth?: number;
  /** Cor do traço de progresso (classe de stroke). */
  strokeClass?: string;
  /** Cor do trilho (fundo). */
  trackClass?: string;
  children?: ReactNode;
  className?: string;
}

/**
 * Barra de progresso circular animada em SVG.
 * Usa stroke-dashoffset com transição CSS para movimento fluido.
 */
export function CircularProgress({
  progress,
  size = 320,
  strokeWidth = 14,
  strokeClass = 'stroke-indigo-500',
  trackClass = 'stroke-zinc-200 dark:stroke-zinc-800',
  children,
  className,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, progress));
  const offset = circumference * (1 - clamped);

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, maxWidth: '100%', aspectRatio: '1 / 1' }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90 max-w-full"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped * 100)}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={cn('transition-colors', trackClass)}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            'transition-[stroke-dashoffset] duration-1000 ease-linear',
            strokeClass,
          )}
        />
      </svg>
      {/* Círculo interno translúcido (efeito vidro): preenchido até o anel,
          com blur de fundo e sombra interna de profundidade. */}
      <div
        className="pointer-events-none absolute rounded-full border border-zinc-200/50 bg-white/40 shadow-[inset_0_10px_28px_rgba(0,0,0,0.14)] backdrop-blur-md dark:border-white/15 dark:bg-white/5 dark:shadow-[inset_0_10px_28px_rgba(0,0,0,0.4)]"
        style={{ inset: strokeWidth }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        {children}
      </div>
    </div>
  );
}