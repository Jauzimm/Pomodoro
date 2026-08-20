import {
  Check,
  Pencil,
  Target,
  Trash2,
  X,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { useStore } from '../../../app/store';
import type { Task } from '../../../core/types/domain';
import { cn } from '../../../shared/utils/cn';
import { useTranslation } from '../../../shared/i18n/useTranslation';
import { PriorityBadge } from '../../../shared/components/ui/Badge';

interface TaskItemProps {
  task: Task;
}

/**
 * Linha individual da lista de tarefas (usada como `TodoList.Item`).
 * Suporta concluir, editar inline, definir como ativa, reordenar e excluir.
 */
export function TaskItem({ task }: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);

  const isActive = useStore((s) => s.activeTaskId === task.id);
  const toggleTask = useStore((s) => s.toggleTask);
  const removeTask = useStore((s) => s.removeTask);
  const editTask = useStore((s) => s.editTask);
  const setActiveTask = useStore((s) => s.setActiveTask);
  const { t } = useTranslation();

  const saveEdit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== task.title) editTask(task.id, { title: trimmed });
    setEditing(false);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    saveEdit();
  };

  return (
    <li
      className={cn(
        'group flex flex-col gap-2 rounded-xl border px-3 py-3 transition-all duration-200',
        isActive
          ? 'border-indigo-500/60 bg-indigo-500/5 shadow-sm shadow-indigo-500/10'
          : 'border-transparent hover:border-zinc-200 hover:bg-zinc-50 dark:hover:border-zinc-800 dark:hover:bg-zinc-800/50',
        task.isCompleted && 'opacity-50',
      )}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => toggleTask(task.id)}
          aria-label={task.isCompleted ? t('task.toggleUndone') : t('task.toggleDone')}
          aria-pressed={task.isCompleted}
          className={cn(
            'flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-md border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
            task.isCompleted
              ? 'border-indigo-500 bg-indigo-500 text-white'
              : 'border-zinc-300 hover:border-indigo-400 dark:border-zinc-600',
          )}
        >
          {task.isCompleted && <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />}
        </button>

        <div className="min-w-0 flex-1">
          {editing ? (
            <form onSubmit={onSubmit} className="flex items-center gap-1.5">
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setEditing(false)}
                aria-label={t('task.editTitleAria')}
                className="w-full rounded-lg border border-indigo-300 bg-transparent px-2 py-1 text-base font-semibold outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-indigo-700"
              />
              <button
                type="submit"
                aria-label={t('task.saveEdit')}
                className="rounded-md p-1 text-emerald-500 hover:bg-emerald-500/10"
              >
                <Check className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                aria-label={t('task.cancelEdit')}
                className="rounded-md p-1 text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-700"
              >
                <X className="size-4" />
              </button>
            </form>
          ) : (
            <h3
              className={cn(
                'truncate text-base font-semibold',
                task.isCompleted
                  ? 'text-zinc-400 line-through dark:text-zinc-500'
                  : 'text-zinc-800 dark:text-zinc-100',
              )}
            >
              {task.title}
            </h3>
          )}
        </div>
      </div>

      <div className="h-px w-full bg-zinc-200 dark:bg-zinc-800" aria-hidden="true" />

      <div className="flex items-center gap-2">
        <PriorityBadge priority={task.priority} />
        <span className="text-[11px] font-medium text-zinc-400 tabular-nums dark:text-zinc-500">
          {task.completedPomodoros}/{task.estimatedPomodoros} pomodoros
        </span>

        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={() => setActiveTask(isActive ? null : task.id)}
          aria-label={isActive ? t('task.unsetActive') : t('task.setActive')}
          title={isActive ? t('task.activeTitle') : t('task.linkTitle')}
            className={cn(
              'rounded-lg p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
              isActive
                ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300'
                : 'text-zinc-400 hover:bg-zinc-200/60 hover:text-indigo-500 dark:hover:bg-zinc-700',
            )}
          >
            <Target className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label={t('task.edit')}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => removeTask(task.id)}
            aria-label={t('task.delete')}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-500/10 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    </li>
  );
}
