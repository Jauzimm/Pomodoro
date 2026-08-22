import { ListTodo, Trash2 } from 'lucide-react';
import type { ComponentProps } from 'react';

import { useStore } from '../../../app/store';
import { CardHeader, CardTitle } from '../../../shared/components/ui/Card';
import { useTranslation } from '../../../shared/i18n/useTranslation';

export function TodoListHeader({ ...props }: ComponentProps<'div'>) {
  const clearCompleted = useStore((s) => s.clearCompleted);
  const hasCompleted = useStore((s) => s.tasks.some((t) => t.isCompleted));
  const { t } = useTranslation();

  return (
    <CardHeader {...props}>
      <CardTitle>
        <ListTodo className="size-4 text-indigo-500" aria-hidden="true" />
        {t('tasks.title')}
      </CardTitle>
      <button
        type="button"
        onClick={clearCompleted}
        disabled={!hasCompleted}
        aria-label={t('tasks.clearCompletedAria')}
        className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-400 transition-colors hover:bg-rose-500/10 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Trash2 className="size-3" aria-hidden="true" />
        {t('tasks.clearCompleted')}
      </button>
    </CardHeader>
  );
}
