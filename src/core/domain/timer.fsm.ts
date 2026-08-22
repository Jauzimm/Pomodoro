// ============================================================================
// TIMER FSM — Máquina de Estados Finita determinística e pura
// Camada: Core Domain (sem dependência de React/browser)
//
// Estados:
//   IDLE | RUNNING_FOCUS | PAUSED_FOCUS | RUNNING_SHORT_BREAK |
//   PAUSED_SHORT_BREAK | RUNNING_LONG_BREAK | PAUSED_LONG_BREAK | COMPLETED
//
// A FSM nunca executa efeitos colaterais: ela apenas deriva o próximo estado.
// Eventos: ON_TICK | ON_START | ON_PAUSE | ON_SKIP | ON_RESET | ON_COMPLETE
// ============================================================================

import { DEFAULT_POMODORO_CONFIG, INITIAL_TIMER_STATE } from '../constants';
import type { PomodoroConfig, TimerMode, TimerState } from '../types/domain';

/** Modo base sem RUNNING/PAUSED — usado para rotular o estado. */
export type TimerPhase =
  | 'IDLE'
  | 'RUNNING_FOCUS'
  | 'PAUSED_FOCUS'
  | 'RUNNING_SHORT_BREAK'
  | 'PAUSED_SHORT_BREAK'
  | 'RUNNING_LONG_BREAK'
  | 'PAUSED_LONG_BREAK'
  | 'COMPLETED';

export type TimerEvent =
  | { type: 'ON_TICK'; secondsElapsed: number }
  | { type: 'ON_START' }
  | { type: 'ON_PAUSE' }
  | { type: 'ON_SKIP' }
  | { type: 'ON_RESET' }
  | { type: 'ON_COMPLETE' };

export type TimerTransition =
  | { kind: 'NEXT'; state: TimerState; phase: TimerPhase }
  | { kind: 'COMPLETED_CYCLE'; state: TimerState; phase: TimerPhase; completedMode: TimerMode };

/** Duração em segundos do modo atual. */
export const durationOf = (config: PomodoroConfig, mode: TimerMode): number =>
  mode === 'FOCUS'
    ? config.focusDuration * 60
    : mode === 'SHORT_BREAK'
      ? config.shortBreakDuration * 60
      : config.longBreakDuration * 60;

export const phaseOf = (state: TimerState): TimerPhase => {
  if (state.status === 'IDLE') return 'IDLE';
  const mode =
    state.mode === 'FOCUS'
      ? 'FOCUS'
      : state.mode === 'SHORT_BREAK'
        ? 'SHORT_BREAK'
        : 'LONG_BREAK';
  const status = state.status === 'RUNNING' ? 'RUNNING' : 'PAUSED';
  return `${status}_${mode}` as TimerPhase;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/** Próximo modo seguindo o fluxo 4×Foco → Descanso Longo. */
export const nextMode = (
  mode: TimerMode,
  currentCycle: number,
  config: PomodoroConfig,
): TimerMode => {
  if (mode !== 'FOCUS') return 'FOCUS';
  return currentCycle >= config.cyclesBeforeLongBreak ? 'LONG_BREAK' : 'SHORT_BREAK';
};

/**
 * Reducer puro da FSM. Retorna uma transição; nunca muta o estado recebido.
 */
export function timerReducer(
  state: TimerState,
  event: TimerEvent,
  config: PomodoroConfig = DEFAULT_POMODORO_CONFIG,
): TimerTransition {
  const phase = phaseOf(state);

  switch (event.type) {
    case 'ON_START': {
      if (phase === 'COMPLETED' || state.status === 'RUNNING') return { kind: 'NEXT', state, phase };
      return {
        kind: 'NEXT',
        state: { ...state, status: 'RUNNING' },
        phase: `RUNNING_${state.mode}` as TimerPhase,
      };
    }

    case 'ON_PAUSE': {
      if (state.status !== 'RUNNING') return { kind: 'NEXT', state, phase };
      return {
        kind: 'NEXT',
        state: { ...state, status: 'PAUSED' },
        phase: `PAUSED_${state.mode}` as TimerPhase,
      };
    }

    case 'ON_TICK': {
      if (state.status !== 'RUNNING') return { kind: 'NEXT', state, phase };
      const next = Math.max(0, state.timeLeft - event.secondsElapsed);
      if (next > 0) {
        return { kind: 'NEXT', state: { ...state, timeLeft: next }, phase };
      }
      // Tempo esgotado → transição de completude (o orquestrador decide o destino).
      return {
        kind: 'COMPLETED_CYCLE',
        state: { ...state, timeLeft: 0 },
        phase: 'COMPLETED',
        completedMode: state.mode,
      };
    }

    case 'ON_COMPLETE': {
      const completedFocus = state.mode === 'FOCUS';
      const nextCycle = completedFocus
        ? (state.currentCycle % config.cyclesBeforeLongBreak) + 1
        : state.currentCycle;
      const next: TimerMode = completedFocus
        ? nextMode(state.mode, state.currentCycle, config)
        : 'FOCUS';
      return {
        kind: 'NEXT',
        state: {
          mode: next,
          status: 'IDLE',
          timeLeft: durationOf(config, next),
          currentCycle: nextCycle,
          totalCompletedSessions: state.totalCompletedSessions + (completedFocus ? 1 : 0),
        },
        phase: 'IDLE',
      };
    }

    case 'ON_SKIP': {
      const next: TimerMode =
        state.mode === 'FOCUS'
          ? nextMode(state.mode, state.currentCycle, config)
          : 'FOCUS';
      const skipCompletedFocus = state.mode === 'FOCUS';
      return {
        kind: 'NEXT',
        state: {
          mode: next,
          status: 'IDLE',
          timeLeft: durationOf(config, next),
          currentCycle: skipCompletedFocus
            ? (state.currentCycle % config.cyclesBeforeLongBreak) + 1
            : state.currentCycle,
          totalCompletedSessions:
            state.totalCompletedSessions + (skipCompletedFocus ? 1 : 0),
        },
        phase: 'IDLE',
      };
    }

    case 'ON_RESET':
    default: {
      return {
        kind: 'NEXT',
        state: {
          ...INITIAL_TIMER_STATE,
          mode: state.mode,
          timeLeft: durationOf(config, state.mode),
          currentCycle: clamp(state.currentCycle, 1, config.cyclesBeforeLongBreak),
        },
        phase: 'IDLE',
      };
    }
  }
}

/** Indica se o phase representa um estado em execução. */
export const isRunning = (phase: TimerPhase): boolean => phase.startsWith('RUNNING');