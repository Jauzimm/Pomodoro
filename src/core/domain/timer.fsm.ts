// ============================================================================
// TIMER FSM — Máquina de Estados Finita determinística e pura (State Pattern)
// Camada: Core Domain (sem dependência de React/browser/DOM)
//
// Estados FSM:
//   IDLE | RUNNING_FOCUS | PAUSED_FOCUS | RUNNING_SHORT_BREAK |
//   PAUSED_SHORT_BREAK | RUNNING_LONG_BREAK | PAUSED_LONG_BREAK | COMPLETED
//
// A FSM nunca executa efeitos colaterais: ela apenas deriva o próximo estado.
// Eventos: ON_TICK | ON_START | ON_PAUSE | ON_SKIP | ON_RESET | ON_COMPLETE
// ============================================================================

import { DEFAULT_POMODORO_CONFIG, INITIAL_TIMER_STATE } from '../constants';
import type { PomodoroConfig, TimerMode, TimerState } from '../types/domain';

/** Modo base com status de execução — usado para rotular o estado da FSM. */
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

/** Duração em segundos do modo atual com base na configuração. */
export const durationOf = (config: PomodoroConfig, mode: TimerMode): number => {
  switch (mode) {
    case 'FOCUS':
      return config.focusDuration * 60;
    case 'SHORT_BREAK':
      return config.shortBreakDuration * 60;
    case 'LONG_BREAK':
      return config.longBreakDuration * 60;
  }
};

/** Mapeia o estado atual para a fase correspondente da FSM. */
export const phaseOf = (state: TimerState): TimerPhase => {
  if (state.status === 'IDLE') return 'IDLE';
  const status = state.status === 'RUNNING' ? 'RUNNING' : 'PAUSED';
  return `${status}_${state.mode}` as TimerPhase;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/** Próximo modo no ciclo padrão (4×Foco → Descanso Longo). */
export const nextMode = (
  mode: TimerMode,
  currentCycle: number,
  config: PomodoroConfig,
): TimerMode => {
  if (mode !== 'FOCUS') return 'FOCUS';
  return currentCycle >= config.cyclesBeforeLongBreak ? 'LONG_BREAK' : 'SHORT_BREAK';
};

// ----------------------------------------------------------------------------
// Funções de Guarda Semânticas (State Guards)
// ----------------------------------------------------------------------------

export const canStart = (state: TimerState): boolean =>
  state.status !== 'RUNNING' && state.timeLeft > 0;

export const canPause = (state: TimerState): boolean =>
  state.status === 'RUNNING';

export const canReset = (state: TimerState): boolean =>
  state.status !== 'IDLE' || state.timeLeft !== durationOf(DEFAULT_POMODORO_CONFIG, state.mode);

export const isRunning = (phase: TimerPhase): boolean =>
  phase.startsWith('RUNNING');

// ----------------------------------------------------------------------------
// Handlers Especializados de Transição (State Handlers)
// ----------------------------------------------------------------------------

function handleStart(state: TimerState, phase: TimerPhase): TimerTransition {
  if (phase === 'COMPLETED' || state.status === 'RUNNING') {
    return { kind: 'NEXT', state, phase };
  }
  return {
    kind: 'NEXT',
    state: { ...state, status: 'RUNNING' },
    phase: `RUNNING_${state.mode}` as TimerPhase,
  };
}

function handlePause(state: TimerState, phase: TimerPhase): TimerTransition {
  if (state.status !== 'RUNNING') {
    return { kind: 'NEXT', state, phase };
  }
  return {
    kind: 'NEXT',
    state: { ...state, status: 'PAUSED' },
    phase: `PAUSED_${state.mode}` as TimerPhase,
  };
}

function handleTick(
  state: TimerState,
  secondsElapsed: number,
  phase: TimerPhase,
): TimerTransition {
  if (state.status !== 'RUNNING') {
    return { kind: 'NEXT', state, phase };
  }
  const next = Math.max(0, state.timeLeft - secondsElapsed);
  if (next > 0) {
    return { kind: 'NEXT', state: { ...state, timeLeft: next }, phase };
  }
  // Tempo esgotado -> sinaliza completude de ciclo
  return {
    kind: 'COMPLETED_CYCLE',
    state: { ...state, timeLeft: 0 },
    phase: 'COMPLETED',
    completedMode: state.mode,
  };
}

function handleComplete(
  state: TimerState,
  config: PomodoroConfig,
): TimerTransition {
  const completedFocus = state.mode === 'FOCUS';
  const nextCycle = completedFocus
    ? (state.currentCycle % config.cyclesBeforeLongBreak) + 1
    : state.currentCycle;
  const next = completedFocus
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

function handleSkip(
  state: TimerState,
  config: PomodoroConfig,
): TimerTransition {
  const next = state.mode === 'FOCUS'
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

function handleReset(
  state: TimerState,
  config: PomodoroConfig,
): TimerTransition {
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

/**
 * Reducer puro e determinístico da FSM.
 * Retorna uma nova transição sem efeitos colaterais nem mutação de estado.
 */
export function timerReducer(
  state: TimerState,
  event: TimerEvent,
  config: PomodoroConfig = DEFAULT_POMODORO_CONFIG,
): TimerTransition {
  const phase = phaseOf(state);

  switch (event.type) {
    case 'ON_START':
      return handleStart(state, phase);
    case 'ON_PAUSE':
      return handlePause(state, phase);
    case 'ON_TICK':
      return handleTick(state, event.secondsElapsed, phase);
    case 'ON_COMPLETE':
      return handleComplete(state, config);
    case 'ON_SKIP':
      return handleSkip(state, config);
    case 'ON_RESET':
      return handleReset(state, config);
  }
}
