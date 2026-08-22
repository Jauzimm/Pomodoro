// ============================================================================
// TASK SORTING — Regras de ordenação de tarefas (Domain Service)
// Camada: Tasks Domain
// ============================================================================

import { PRIORITY_ORDER } from '../../../core/constants';
import type { Task } from '../../../core/types/domain';

/**
 * Ordena tarefas estritamente por prioridade (HIGH -> MEDIUM -> LOW) e data de criação.
 */
export function sortTasksByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort(
    (a, b) =>
      PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
      b.createdAt - a.createdAt,
  );
}

/**
 * Ordena tarefas para exibição na UI:
 * 1. Não-concluídas primeiro, concluídas no fim.
 * 2. Prioridade (HIGH -> MEDIUM -> LOW).
 * 3. Mais recentes primeiro.
 */
export function sortTasksForDisplay(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    return (
      PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
      b.createdAt - a.createdAt
    );
  });
}
