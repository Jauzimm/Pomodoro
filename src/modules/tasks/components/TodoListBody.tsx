import { CheckSquare } from 'lucide-react';

import { CardBody } from '../../../shared/components/ui/Card';
import { useTranslation } from '../../../shared/i18n/useTranslation';
import { useSortedTasks } from '../hooks/useSortedTasks';
import { TaskItem } from './TaskItem';

export function TodoListBody() {
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
