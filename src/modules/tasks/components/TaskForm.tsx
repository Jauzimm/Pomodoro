import { AlertCircle, Plus } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent } from 'react';

import { useStore } from '../../../app/store';
import type { TaskPriority } from '../../../core/types/domain';
import { cn } from '../../../shared/utils/cn';
import { useTranslation } from '../../../shared/i18n/useTranslation';
import { PrioritySelector } from './PrioritySelector';

const MAX_TITLE_LENGTH = 30;

/** Formulário de adição rápida: texto + prioridade + pomodoros estimados. */
export function TaskForm() {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [estimated, setEstimated] = useState(1);
  const [overLimit, setOverLimit] = useState(false);

  const addTask = useStore((s) => s.addTask);
  const { t } = useTranslation();

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    if (next.length > MAX_TITLE_LENGTH) {
      setOverLimit(true);
      setTitle(next.slice(0, MAX_TITLE_LENGTH));
    } else {
      setOverLimit(false);
      setTitle(next);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(title, priority, estimated);
    setTitle('');
    setEstimated(1);
    setOverLimit(false);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-2.5" aria-label="Adicionar nova tarefa">
      <div className="flex gap-2">
        <input
          value={title}
          onChange={handleTitleChange}
          onKeyDown={() => setOverLimit(false)}
          placeholder={t('task.titlePlaceholder')}
          aria-label={t('task.titleAria')}
          aria-invalid={overLimit}
          className={cn(
            'h-10 flex-1 rounded-xl border bg-white/70 px-3 text-sm text-zinc-800 shadow-inner shadow-black/[0.02] outline-none backdrop-blur-sm transition-colors placeholder:text-zinc-400',
            overLimit
              ? 'border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 dark:border-rose-500/70 dark:text-zinc-50'
              : 'border-zinc-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 dark:border-white/15 dark:bg-white/10 dark:text-zinc-50 dark:placeholder:text-zinc-400/60',
          )}
        />
        <button
          type="submit"
          aria-label="Adicionar tarefa"
          disabled={!title.trim()}
          className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="size-5" />
        </button>
      </div>

      {overLimit && (
        <p
          role="alert"
          className="flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400"
        >
          <AlertCircle className="size-3.5" aria-hidden="true" />
          {t('task.limitWarning', { max: MAX_TITLE_LENGTH })}
        </p>
      )}

      <div className="flex items-center gap-2">
        <PrioritySelector value={priority} onChange={setPriority} label={t('task.priorityAria')} />
        <label className="flex shrink-0 items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          {t('task.pomodoros')}
          <input
            type="number"
            min={1}
            max={50}
            value={estimated}
            onChange={(e) => setEstimated(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
            aria-label={t('task.estimatedPomodoros')}
            className="h-8 w-14 rounded-lg border border-zinc-200 bg-white/70 px-2 text-center text-xs font-semibold tabular-nums outline-none backdrop-blur-sm transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 dark:border-white/15 dark:bg-white/10 dark:text-zinc-100"
          />
        </label>
      </div>
    </form>
  );
}