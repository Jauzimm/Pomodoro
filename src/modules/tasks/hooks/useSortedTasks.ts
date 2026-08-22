// ============================================================================
// USE SORTED TASKS — Hook de consulta de tarefas ordenadas para exibição
// Camada: Tasks Hooks
// ============================================================================

import { useMemo } from 'react';
import { useStore } from '../../../app/store';
import type { Task } from '../../../core/types/domain';
import { sortTasksForDisplay } from '../domain/taskSorting';
import { selectTasks } from '../tasks.slice';

export { sortTasksForDisplay as sortTasksByPriority } from '../domain/taskSorting';

/**
 * Hook com memoização: retorna a lista de tarefas ordenada para a UI
 * (não-concluídas primeiro, ordenadas por prioridade e criação).
 */
export function useSortedTasks(): Task[] {
  const tasks = useStore(selectTasks);
  return useMemo(() => sortTasksForDisplay(tasks), [tasks]);
}
