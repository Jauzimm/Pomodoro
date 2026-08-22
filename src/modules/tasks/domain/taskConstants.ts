// ============================================================================
// TASK CONSTANTS — Metadados e constantes do módulo de tarefas
// Camada: Tasks Domain
// ============================================================================

import type { TaskPriority } from '../../../core/types/domain';

export const PRIORITY_OPTIONS: {
  id: TaskPriority;
  activeClass: string;
}[] = [
  { id: 'HIGH', activeClass: 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  { id: 'MEDIUM', activeClass: 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { id: 'LOW', activeClass: 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
];
