// ============================================================================
// TIMER SLICE — Motor do Pomodoro (FSM + delta-time)
// Camada: Application Logic (Zustand)
// ============================================================================

import type { StateCreator } from 'zustand';

import type { AppStore } from '../../app/store';
import { domainEventBus } from '../../core/domain/eventBus';
import {
  durationOf,
  timerReducer,
  type TimerPhase,
  type TimerTransition,
} from '../../core/domain/timer.fsm';
import type { PomodoroConfig, TimerState } from '../../core/types/domain';

export interface TimerSlice {
  timer: TimerState;
  config: PomodoroConfig;
  phase: TimerPhase;
  /** Inicia/pausa respeitando o estado atual da FSM. */
  toggle: () => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  /** Tique com delta de tempo real (evita drift em aba inativa). */
  tick: (secondsElapsed: number) => void;
  applyConfig: (config: PomodoroConfig) => void;
}

/** Aplica uma transição da FSM ao estado do store. */
const applyTransition = (
  transition: TimerTransition,
): { timer: TimerState; phase: TimerPhase } => ({
  timer: transition.state,
  phase: transition.phase,
});

export const createTimerSlice: StateCreator<
  AppStore,
  [],
  [],
  TimerSlice
> = (set, get) => {
  const emitPhaseChanged = (state: TimerState) => {
    domainEventBus.emit('timer:phase-changed', {
      mode: state.mode,
      status: state.status,
    });
  };

  return {
    timer: {
      mode: 'FOCUS',
      status: 'IDLE',
      timeLeft: 25 * 60,
      currentCycle: 1,
      totalCompletedSessions: 0,
    },
    config: {
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      cyclesBeforeLongBreak: 4,
      autoStartBreaks: true,
      autoStartPomodoros: false,
    },
    phase: 'IDLE',

    toggle: () => {
      const { timer, config } = get();
      const shouldStart = timer.status !== 'RUNNING';
      const transition = timerReducer(
        timer,
        shouldStart ? { type: 'ON_START' } : { type: 'ON_PAUSE' },
        config,
      );
      set(applyTransition(transition));
      emitPhaseChanged(transition.state);
    },

    start: () => {
      const { timer, config } = get();
      const transition = timerReducer(timer, { type: 'ON_START' }, config);
      set(applyTransition(transition));
      emitPhaseChanged(transition.state);
    },

    pause: () => {
      const { timer, config } = get();
      const transition = timerReducer(timer, { type: 'ON_PAUSE' }, config);
      set(applyTransition(transition));
      emitPhaseChanged(transition.state);
    },

    reset: () => {
      const { timer, config } = get();
      const transition = timerReducer(timer, { type: 'ON_RESET' }, config);
      set(applyTransition(transition));
      emitPhaseChanged(transition.state);
    },

    skip: () => {
      const { timer, config } = get();
      const transition = timerReducer(timer, { type: 'ON_SKIP' }, config);
      set(applyTransition(transition));
      emitPhaseChanged(transition.state);
      if (transition.state.mode === 'FOCUS') {
        domainEventBus.emit('timer:completed', {
          completedMode: 'FOCUS',
          totalCompletedSessions: transition.state.totalCompletedSessions,
        });
      }
    },

    tick: (secondsElapsed) => {
      const { timer, config } = get();
      const transition = timerReducer(
        timer,
        { type: 'ON_TICK', secondsElapsed },
        config,
      );
      set(applyTransition(transition));

      if (transition.kind === 'COMPLETED_CYCLE') {
        // Avança a FSM para o próximo modo (foco → descanso, e vice-versa).
        const afterComplete = timerReducer(
          transition.state,
          { type: 'ON_COMPLETE' },
          config,
        );
        set(applyTransition(afterComplete));

        emitPhaseChanged(afterComplete.state);
        domainEventBus.emit('timer:completed', {
          completedMode: transition.completedMode,
          totalCompletedSessions: afterComplete.state.totalCompletedSessions,
        });

        // Auto-início configurável no próximo modo.
        const shouldAutoStart =
          transition.completedMode === 'FOCUS'
            ? config.autoStartBreaks
            : config.autoStartPomodoros;
        if (shouldAutoStart) get().start();
      }
    },

    applyConfig: (config) => {
      const { timer } = get();
      const running = timer.status === 'RUNNING';
      set((state) => ({
        config,
        timer: {
          ...state.timer,
          timeLeft: running
            ? state.timer.timeLeft
            : durationOf(config, state.timer.mode),
        },
      }));
      emitPhaseChanged(get().timer);
    },
  };
};

/** Seletores granulares (evitam re-renders desnecessários). */
export const selectTimeLeft = (s: TimerSlice) => s.timer.timeLeft;
export const selectMode = (s: TimerSlice) => s.timer.mode;
export const selectStatus = (s: TimerSlice) => s.timer.status;
export const selectCycle = (s: TimerSlice) => s.timer.currentCycle;
export const selectPhase = (s: TimerSlice) => s.phase;
export const selectTotalSessions = (s: TimerSlice) => s.timer.totalCompletedSessions;
export const selectConfig = (s: TimerSlice) => s.config;
export const selectCurrentDuration = (s: TimerSlice) => durationOf(s.config, s.timer.mode);
export const selectIsRunning = (s: TimerSlice) => s.timer.status === 'RUNNING';
export const selectTick = (s: TimerSlice) => s.tick;

export const selectCycleCount = (s: TimerSlice) => s.config.cyclesBeforeLongBreak;

export const phaseLabel = (phase: TimerPhase): string =>
  phase.includes('FOCUS')
    ? 'Foco'
    : phase.includes('SHORT_BREAK')
      ? 'Descanso Curto'
      : phase.includes('LONG_BREAK')
        ? 'Descanso Longo'
        : phase === 'COMPLETED'
          ? 'Concluído'
          : 'Pronto';