import { cn } from '../../utils/cn';
import type { TaskPriority } from '../../../core/types/domain';
import { useTranslation } from '../../i18n/useTranslation';

const priorityStyles: Record<TaskPriority, string> = {
  HIGH: 'bg-rose-500/10 text-rose-600 ring-rose-500/20 dark:text-rose-400',
  MEDIUM: 'bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-400',
  LOW: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400',
};

const PRIORITY_KEYS: Record<TaskPriority, 'priority.high' | 'priority.medium' | 'priority.low'> = {
  HIGH: 'priority.high',
  MEDIUM: 'priority.medium',
  LOW: 'priority.low',
};

interface BadgeProps {
  priority: TaskPriority;
  className?: string;
}

export function PriorityBadge({ priority, className }: BadgeProps) {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset',
        priorityStyles[priority],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {t(PRIORITY_KEYS[priority])}
    </span>
  );
}