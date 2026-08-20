import { useStore } from '../../../app/store';
import { PRIORITY_ORDER } from '../../../core/constants';
import type { Task } from '../../../core/types/domain';

/**
 * Ordena as tarefas por prioridade (HIGH → MEDIUM → LOW) e, em caso de
 * empate, pela mais recente primeiro. As concluídas vão para o fim.
 */
export function sortTasksByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
    return (
      PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
      b.createdAt - a.createdAt
    );
  });
}

/** Hook: retorna as tarefas já ordenadas por prioridade. */
export function useSortedTasks(): Task[] {
  const tasks = useStore((s) => s.tasks);
  return sortTasksByPriority(tasks);
}