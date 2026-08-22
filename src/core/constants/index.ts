// ============================================================================
// CONSTANTS — Valores padrão e configurações invariantes do domínio
// ============================================================================

import type {
  AmbientSoundType,
  AudioSettings,
  PomodoroConfig,
  SoundAlertPreset,
  Task,
  TaskPriority,
  TimerMode,
  TimerState,
} from '../types/domain';

/** Configuração padrão do Pomodoro (25/5/15, 4 ciclos). */
export const DEFAULT_POMODORO_CONFIG: PomodoroConfig = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  cyclesBeforeLongBreak: 4,
  autoStartBreaks: true,
  autoStartPomodoros: false,
};

/** Estado inicial da FSM do timer. */
export const INITIAL_TIMER_STATE: TimerState = {
  mode: 'FOCUS',
  status: 'IDLE',
  timeLeft: DEFAULT_POMODORO_CONFIG.focusDuration * 60,
  currentCycle: 1,
  totalCompletedSessions: 0,
};

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  alertSound: 'TIBETAN_BOWL',
  alertVolume: 0.6,
  ambientType: null,
  ambientVolume: 0.4,
  isMuted: false,
};

export const DEFAULT_NOTE = { content: '', lastUpdated: 0 };

export const INITIAL_TASKS: Task[] = [];

/** Limites de duração por modo (minutos), aplicados no modal de configurações. */
export const DURATION_LIMITS: Record<
  TimerMode,
  { min: number; max: number; step: number }
> = {
  FOCUS: { min: 1, max: 60, step: 1 },
  SHORT_BREAK: { min: 1, max: 30, step: 1 },
  LONG_BREAK: { min: 1, max: 60, step: 1 },
};

export const CYCLES_LIMITS = { min: 1, max: 12, step: 1 };

/** Metadados de exibição de cada preset de alarme. */
export const SOUND_PRESETS: {
  id: SoundAlertPreset;
  label: string;
  description: string;
}[] = [
  { id: 'TIBETAN_BOWL', label: 'Sino Tibetano', description: 'Harmônicos suaves e longos' },
  { id: 'DIGITAL_ALARM', label: 'Alarme Digital', description: 'Bipes clássicos e urgentes' },
  { id: 'SOFT_BEEP', label: 'Bip Suave', description: 'Toque curto e discreto' },
];

/** Metadados de exibição de cada som ambiente. */
export const AMBIENT_SOUNDS: {
  id: AmbientSoundType;
  label: string;
  description: string;
}[] = [
  { id: 'LOFI_BEATS', label: 'Lo-Fi Beats', description: 'Chords chill com crackle de vinil' },
  { id: 'RAIN', label: 'Chuva', description: 'Ruído filtrado com gotas' },
  { id: 'CAFE', label: 'Cafeteria', description: 'Burburinho suave de pessoas' },
  { id: 'FIREPLACE', label: 'Lareira', description: 'Crepitar constante de lenha' },
  { id: 'BROWN_NOISE', label: 'Ruído Marrom', description: 'Grave e profundo' },
];

export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

export const STORAGE_KEYS = {
  appState: 'studyspace:app-state:v1',
} as const;