import { CheckSquare, ListTodo, Trash2 } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';

import { useStore } from '../../../app/store';
import { PriorityBadge } from '../../../shared/components/ui/Badge';
import { Card, CardBody, CardHeader, CardTitle } from '../../../shared/components/ui/Card';
import { cn } from '../../../shared/utils/cn';
import { useTranslation } from '../../../shared/i18n/useTranslation';
import { useSortedTasks } from '../hooks/useSortedTasks';
import { TaskItem } from './TaskItem';

/**
 * Lista de Tarefas com prioridades — padrão Compound Components:
 *
 *   <TodoList>
 *     <TodoList.Header />   → título + limpar concluídas
 *     <TodoList.Item />     → linha individual
 *     <TodoList.PriorityBadge /> → selo de prioridade
 *   </TodoList>
 */

interface TodoListRootProps {
  children: ReactNode;
  className?: string;
}

function TodoListRoot({ children, className }: TodoListRootProps) {
  return <Card className={cn('flex h-full flex-col', className)}>{children}</Card>;
}

function TodoListHeader({ ...props }: ComponentProps<'div'>) {
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

function TodoListBody() {
  const tasks = useSortedTasks();
  const { t } = useTranslation();

  if (tasks.length === 0) {
    return (
      <CardBody className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <CheckSquare className="size-8 text-zinc-300 dark:text-zinc-700" aria-hidden="true" />
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t('tasks.empty')}</p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          {t('tasks.emptyHint')}
        </p>
      </CardBody>
    );
  }

  return (
    <ul className="flex-1 space-y-1 overflow-y-auto px-3 pb-3" aria-label={t('tasks.listAria')}>
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  );
}

/** Componente composto exportado com os membros do padrão Compound. */
export const TodoList = Object.assign(TodoListRoot, {
  Header: TodoListHeader,
  Item: TaskItem,
  PriorityBadge,
  Body: TodoListBody,
});