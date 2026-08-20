import { useEffect } from 'react';

import { useStore } from '../../../app/store';
import { domainEventBus } from '../../../core/domain/eventBus';

/**
 * Observer da integração Timer → Tarefas: cada sessão de Foco concluída
 * incrementa o contador de pomodoros da tarefa ativa.
 */
export function useTaskPomodoroTracking(): void {
  const incrementActivePomodoro = useStore((s) => s.incrementActivePomodoro);

  useEffect(() => {
    const unsubscribe = domainEventBus.subscribe('timer:completed', (event) => {
      if (event.completedMode === 'FOCUS') {
        incrementActivePomodoro();
      }
    });
    return unsubscribe;
  }, [incrementActivePomodoro]);
}