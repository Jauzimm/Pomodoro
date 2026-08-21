// ============================================================================
// DOMAIN TYPES — Contratos rígidos e imutáveis do PomoraNeo
// Camada: Core Domain (agnóstica de framework)
// ============================================================================

// --- TIMER & FSM ---
export type TimerMode = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';
export type TimerStatus = 'IDLE' | 'RUNNING' | 'PAUSED';

export interface PomodoroConfig {
  /** Duração do foco em minutos (1 a 60). */
  focusDuration: number;
  /** Duração do descanso curto em minutos (1 a 30). */
  shortBreakDuration: number;
  /** Duração do descanso longo em minutos (1 a 60). */
  longBreakDuration: number;
  /** Ciclos de foco antes de engatilhar o descanso longo (padrão: 4). */
  cyclesBeforeLongBreak: number;
  /** Inicia o descanso automaticamente ao fim do foco. */
  autoStartBreaks: boolean;
  /** Inicia o foco automaticamente ao fim do descanso. */
  autoStartPomodoros: boolean;
}

export interface TimerState {
  mode: TimerMode;
  status: TimerStatus;
  /** Tempo restante em segundos. */
  timeLeft: number;
  /** Ciclo atual (ex: 1 a 4). */
  currentCycle: number;
  /** Sessões de foco concluídas no total (acumulado). */
  totalCompletedSessions: number;
}

// --- TO-DO & PRIORITY ---
export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  priority: TaskPriority;
  estimatedPomodoros: number;
  completedPomodoros: number;
  createdAt: number;
}

// --- NOTES ---
export interface Note {
  content: string;
  lastUpdated: number;
}

// --- AUDIO ---
export type SoundAlertPreset =
  | 'TIBETAN_BOWL'
  | 'DIGITAL_ALARM'
  | 'SOFT_BEEP';

export type AmbientSoundType =
  | 'LOFI_BEATS'
  | 'RAIN'
  | 'CAFE'
  | 'FIREPLACE'
  | 'BROWN_NOISE';

export interface AudioSettings {
  alertSound: SoundAlertPreset;
  /** Volume do alarme, 0 a 1. */
  alertVolume: number;
  ambientType: AmbientSoundType | null;
  /** Volume do ambiente, 0 a 1. */
  ambientVolume: number;
  isMuted: boolean;
}