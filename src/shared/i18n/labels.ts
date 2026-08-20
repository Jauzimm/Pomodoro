// ============================================================================
// I18N LABELS — Mapeia modos/fases da FSM para chaves de tradução
// Camada: Shared (utilitário de aplicação)
// ============================================================================

import type { TimerMode } from '../../core/types/domain';
import type { TimerPhase } from '../../core/domain/timer.fsm';
import type { TranslationKey } from './translations';

const MODE_KEYS: Record<TimerMode, TranslationKey> = {
  FOCUS: 'mode.focus',
  SHORT_BREAK: 'mode.shortBreak',
  LONG_BREAK: 'mode.longBreak',
};

export const modeKey = (mode: TimerMode): TranslationKey => MODE_KEYS[mode];

export const phaseKey = (phase: TimerPhase): TranslationKey => {
  if (phase.includes('FOCUS')) return 'phase.focus';
  if (phase.includes('SHORT_BREAK')) return 'phase.shortBreak';
  if (phase.includes('LONG_BREAK')) return 'phase.longBreak';
  if (phase === 'COMPLETED') return 'phase.completed';
  return 'phase.ready';
};
