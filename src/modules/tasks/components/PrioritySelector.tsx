import type { TaskPriority } from '../../../core/types/domain';
import { cn } from '../../../shared/utils/cn';
import { useTranslation } from '../../../shared/i18n/useTranslation';

export const PRIORITY_OPTIONS: {
  id: TaskPriority;
  activeClass: string;
}[] = [
  { id: 'HIGH', activeClass: 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  { id: 'MEDIUM', activeClass: 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { id: 'LOW', activeClass: 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
];

const PRIORITY_KEYS: Record<TaskPriority, 'priority.high' | 'priority.medium' | 'priority.low'> = {
  HIGH: 'priority.high',
  MEDIUM: 'priority.medium',
  LOW: 'priority.low',
};

interface PrioritySelectorProps {
  value: TaskPriority;
  onChange: (priority: TaskPriority) => void;
  label?: string;
  className?: string;
}

/** Seletor segmentado de prioridade (High/Medium/Low). */
export function PrioritySelector({ value, onChange, label, className }: PrioritySelectorProps) {
  const { t } = useTranslation();
  return (
    <div
      role="radiogroup"
      aria-label={label ?? t('priority.label')}
      className={cn(
        'flex overflow-hidden rounded-xl border border-zinc-200 bg-white/40 backdrop-blur-sm dark:border-white/15 dark:bg-white/5',
        className,
      )}
    >
      {PRIORITY_OPTIONS.map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.id)}
            className={cn(
              'flex-1 cursor-pointer border-b-2 px-2 py-1.5 text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500',
              active
                ? option.activeClass
                : 'border-transparent text-zinc-500 hover:bg-white/60 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100',
            )}
          >
            {t(PRIORITY_KEYS[option.id])}
          </button>
        );
      })}
    </div>
  );
}