import { CircleDot, Target } from 'lucide-react';

import { useStore } from '../../../app/store';
import { useTranslation } from '../../../shared/i18n/useTranslation';
import { selectActiveTask } from '../../tasks/tasks.slice';

/**
 * Barra de destaque com o nome da tarefa ativa (vinculada ao timer).
 * Se nenhuma tarefa estiver ativa, mostra uma chamada discreta.
 */
export function ActiveTaskBar() {
  const activeTask = useStore(selectActiveTask);
  const { t } = useTranslation();

  if (!activeTask) {
    return (
      <p className="text-sm text-zinc-50">
        {t('activeTask.none')}
      </p>
    );
  }

  return (
      <div className="flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/15 px-4 py-2.5 backdrop-blur-md">
        <Target className="size-4 shrink-0 text-indigo-500" aria-hidden="true" />
        <p className="truncate text-sm font-medium text-indigo-700 dark:text-indigo-300">
          {activeTask.title}
        </p>
        <span className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-indigo-500/20 px-2 py-0.5 text-[11px] font-semibold text-indigo-600 tabular-nums dark:text-indigo-300">
        <CircleDot className="size-3.5" aria-hidden="true" />
        {activeTask.completedPomodoros}/{activeTask.estimatedPomodoros}
      </span>
    </div>
  );
}