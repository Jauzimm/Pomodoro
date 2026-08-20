// ============================================================================
// EVENT BUS — Comunicação orientada a eventos (Observer Pattern)
// Camada: Core Domain
//
// O fim de um ciclo Pomodoro NUNCA chama a UI, o som ou as tarefas diretamente.
// Ele publica um evento de domínio; cada módulo se inscreve de forma desacoplada.
// ============================================================================

import type { TimerMode } from '../types/domain';

export interface TimerCompletedEvent {
  completedMode: TimerMode;
  /** Quantidade total de sessões de foco concluídas (após o evento). */
  totalCompletedSessions: number;
}

export interface CyclePhaseChangedEvent {
  mode: TimerMode;
  status: 'RUNNING' | 'PAUSED' | 'IDLE';
}

export type DomainEventMap = {
  'timer:completed': TimerCompletedEvent;
  'timer:phase-changed': CyclePhaseChangedEvent;
};

type Listener<T> = (payload: T) => void;

class DomainEventBus {
  private listeners = new Map<keyof DomainEventMap, Set<Listener<unknown>>>();

  subscribe<K extends keyof DomainEventMap>(
    event: K,
    listener: Listener<DomainEventMap[K]>,
  ): () => void {
    const set =
      this.listeners.get(event) ?? new Set<Listener<unknown>>();
    set.add(listener as Listener<unknown>);
    this.listeners.set(event, set);
    return () => set.delete(listener as Listener<unknown>);
  }

  emit<K extends keyof DomainEventMap>(event: K, payload: DomainEventMap[K]): void {
    this.listeners
      .get(event)
      ?.forEach((listener) => listener(payload));
  }
}

/** Singleton global do barramento de eventos de domínio. */
export const domainEventBus = new DomainEventBus();