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

export type Listener<T> = (payload: T) => void;

/**
 * Contrato formal para barramentos de eventos no domínio.
 */
export interface IEventBus<M extends Record<string, unknown>> {
  subscribe<K extends keyof M>(event: K, listener: Listener<M[K]>): () => void;
  emit<K extends keyof M>(event: K, payload: M[K]): void;
}

export class DomainEventBus implements IEventBus<DomainEventMap> {
  private readonly listeners = new Map<keyof DomainEventMap, Set<Listener<unknown>>>();

  /**
   * Registra um ouvinte para um evento de domínio específico.
   * @returns Função de unsubscribe para desregistro seguro.
   */
  subscribe<K extends keyof DomainEventMap>(
    event: K,
    listener: Listener<DomainEventMap[K]>,
  ): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set<Listener<unknown>>();
      this.listeners.set(event, set);
    }
    const genericListener = listener as Listener<unknown>;
    set.add(genericListener);

    return () => {
      set.delete(genericListener);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  /**
   * Emite um evento com isolamento de falhas: se um listener falhar,
   * os demais continuam sendo notificados normalmente.
   */
  emit<K extends keyof DomainEventMap>(event: K, payload: DomainEventMap[K]): void {
    const set = this.listeners.get(event);
    if (!set || set.size === 0) return;

    // Clona o conjunto para prevenir efeitos se listeners se desinscreverem durante o loop
    Array.from(set).forEach((listener) => {
      try {
        listener(payload);
      } catch (error) {
        console.error(`[EventBus] Erro ao processar listener do evento "${String(event)}":`, error);
      }
    });
  }
}

/** Singleton global do barramento de eventos de domínio. */
export const domainEventBus = new DomainEventBus();
