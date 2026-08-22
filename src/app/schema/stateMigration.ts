// ============================================================================
// STATE MIGRATION & SCHEMA VALIDATOR — Proteção de persistência (Zustand Merge)
// Camada: Application Layer / Schema Pipeline
// ============================================================================

import { DEFAULT_AUDIO_SETTINGS, DEFAULT_NOTE, DEFAULT_POMODORO_CONFIG } from '../../core/constants';
import type { AudioSettings, PomodoroConfig, Task } from '../../core/types/domain';
import { detectBrowserLanguage } from '../../shared/i18n/detect';
import { LANGUAGES, type AppLanguage } from '../../shared/i18n/types';
import type { AppStore } from '../store';

/** Estrutura do estado persistido em disco. */
export interface PersistedAppState {
  config?: PomodoroConfig;
  totalCompletedSessions?: number;
  tasks?: Task[];
  activeTaskId?: string | null;
  note?: { content: string; lastUpdated: number };
  audio?: AudioSettings;
  notificationsEnabled?: boolean;
  language?: AppLanguage;
  particlesEnabled?: boolean;
  wallpaper?: {
    activeWallpaperId: string | null;
    customWallpapers: Array<{ id: string; name: string; dataUrl: string }>;
  };
}

/** Validação estrita de número positivo. */
const isPositiveNumber = (val: unknown): val is number =>
  typeof val === 'number' && Number.isFinite(val) && val > 0;

/** Valida e normaliza o schema de PomodoroConfig. */
export function sanitizePomodoroConfig(cfg: unknown): PomodoroConfig {
  if (typeof cfg !== 'object' || cfg === null) {
    return { ...DEFAULT_POMODORO_CONFIG };
  }

  const c = cfg as Record<string, unknown>;

  return {
    focusDuration: isPositiveNumber(c.focusDuration) ? c.focusDuration : DEFAULT_POMODORO_CONFIG.focusDuration,
    shortBreakDuration: isPositiveNumber(c.shortBreakDuration) ? c.shortBreakDuration : DEFAULT_POMODORO_CONFIG.shortBreakDuration,
    longBreakDuration: isPositiveNumber(c.longBreakDuration) ? c.longBreakDuration : DEFAULT_POMODORO_CONFIG.longBreakDuration,
    cyclesBeforeLongBreak: isPositiveNumber(c.cyclesBeforeLongBreak) ? Math.max(1, Math.min(12, c.cyclesBeforeLongBreak)) : DEFAULT_POMODORO_CONFIG.cyclesBeforeLongBreak,
    autoStartBreaks: typeof c.autoStartBreaks === 'boolean' ? c.autoStartBreaks : DEFAULT_POMODORO_CONFIG.autoStartBreaks,
    autoStartPomodoros: typeof c.autoStartPomodoros === 'boolean' ? c.autoStartPomodoros : DEFAULT_POMODORO_CONFIG.autoStartPomodoros,
  };
}

/** Valida e normaliza o idioma selecionado. */
export function sanitizeLanguage(lang: unknown): AppLanguage {
  if (typeof lang === 'string' && LANGUAGES.some((l) => l.id === lang)) {
    return lang as AppLanguage;
  }
  return detectBrowserLanguage();
}

/**
 * Pipeline de sanitização e migração do estado persistido.
 * Protege a aplicação contra valores obsoletos ou formatos antigos salvos em localStorage.
 */
export function sanitizePersistedState(
  persisted: unknown,
  current: AppStore,
): AppStore {
  if (typeof persisted !== 'object' || persisted === null) {
    return current;
  }

  const saved = persisted as PersistedAppState;

  return {
    ...current,
    config: sanitizePomodoroConfig(saved.config),
    tasks: Array.isArray(saved.tasks) ? saved.tasks : current.tasks,
    activeTaskId: typeof saved.activeTaskId === 'string' ? saved.activeTaskId : null,
    note: saved.note && typeof saved.note.content === 'string'
      ? saved.note
      : { ...DEFAULT_NOTE },
    audio: saved.audio && typeof saved.audio === 'object'
      ? { ...DEFAULT_AUDIO_SETTINGS, ...saved.audio }
      : { ...DEFAULT_AUDIO_SETTINGS },
    notificationsEnabled: typeof saved.notificationsEnabled === 'boolean' ? saved.notificationsEnabled : false,
    particlesEnabled: typeof saved.particlesEnabled === 'boolean' ? saved.particlesEnabled : true,
    language: sanitizeLanguage(saved.language),
    activeWallpaperId: saved.wallpaper?.activeWallpaperId ?? null,
    customWallpapers: Array.isArray(saved.wallpaper?.customWallpapers) ? saved.wallpaper.customWallpapers : [],
    timer: {
      ...current.timer,
      totalCompletedSessions: typeof saved.totalCompletedSessions === 'number'
        ? Math.max(0, saved.totalCompletedSessions)
        : current.timer.totalCompletedSessions,
    },
  };
}
