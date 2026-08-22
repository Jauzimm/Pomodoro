// ============================================================================
// STORE — Store Zustand unificado (slices desacoplados + persistência)
// Camada: Application Logic
// ============================================================================

import { create } from 'zustand';
import { persist, type PersistOptions } from 'zustand/middleware';

import { createAppStorage } from './storage';
import { createTimerSlice, type TimerSlice } from '../modules/timer/timer.slice';
import { createTasksSlice, type TasksSlice } from '../modules/tasks/tasks.slice';
import { createNotesSlice, type NotesSlice } from '../modules/notes/notes.slice';
import { createAudioSlice, type AudioSlice } from '../modules/audio/audio.slice';
import {
  createSettingsSlice,
  type SettingsSlice,
} from '../modules/settings/settings.slice';
import {
  createWallpaperSlice,
  type WallpaperSlice,
} from '../modules/wallpaper/wallpaper.slice';
import type { PomodoroConfig, Task } from '../core/types/domain';
import type { AppLanguage } from '../shared/i18n/types';
import { LANGUAGES } from '../shared/i18n/types';
import { detectBrowserLanguage } from '../shared/i18n/detect';

export interface AppStore
  extends TimerSlice,
    TasksSlice,
    NotesSlice,
    AudioSlice,
    SettingsSlice,
    WallpaperSlice {}

/** Subconjunto persistido em disco (o timer em execução nunca é salvo). */
interface PersistedState {
  config: PomodoroConfig;
  totalCompletedSessions: number;
  tasks: Task[];
  activeTaskId: string | null;
  note: NotesSlice['note'];
  audio: AudioSlice['audio'];
  notificationsEnabled: boolean;
  language: AppLanguage;
  particlesEnabled?: boolean;
  wallpaper: Pick<WallpaperSlice, 'activeWallpaperId' | 'customWallpapers'>;
}

const isPersistedState = (value: unknown): value is PersistedState => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.config === 'object' &&
    v.config !== null &&
    Array.isArray(v.tasks) &&
    typeof v.note === 'object' &&
    v.note !== null &&
    typeof v.audio === 'object' &&
    v.audio !== null
  );
};

const persistOptions: PersistOptions<AppStore, PersistedState> = {
  name: 'studyspace:app-state:v1',
  storage: createAppStorage<PersistedState>(),
  partialize: (state) => ({
    config: state.config,
    totalCompletedSessions: state.timer.totalCompletedSessions,
    tasks: state.tasks,
    activeTaskId: state.activeTaskId,
    note: state.note,
    audio: state.audio,
    notificationsEnabled: state.notificationsEnabled,
    language: state.language,
    particlesEnabled: state.particlesEnabled,
    wallpaper: {
      activeWallpaperId: state.activeWallpaperId,
      customWallpapers: state.customWallpapers,
    },
  }),
  merge: (persisted, current) => {
    const saved = isPersistedState(persisted) ? persisted : null;
    if (!saved) return current;
    return {
      ...current,
      config: saved.config,
      tasks: saved.tasks,
      activeTaskId: saved.activeTaskId,
      note: saved.note,
      audio: saved.audio,
      notificationsEnabled: saved.notificationsEnabled,
      particlesEnabled: saved.particlesEnabled ?? true,
      language:
        saved.language && saved.language in LANGUAGES
          ? saved.language
          : detectBrowserLanguage(),
      activeWallpaperId: saved.wallpaper?.activeWallpaperId ?? null,
      customWallpapers: saved.wallpaper?.customWallpapers ?? [],
      timer: {
        ...current.timer,
        totalCompletedSessions: saved.totalCompletedSessions,
      },
    };
  },
};

export const useStore = create<AppStore>()(
  persist(
    (set, get, api) => ({
      ...createTimerSlice(set, get, api),
      ...createTasksSlice(set, get, api),
      ...createNotesSlice(set, get, api),
      ...createAudioSlice(set, get, api),
      ...createSettingsSlice(set, get, api),
      ...createWallpaperSlice(set, get, api),
    }),
    persistOptions,
  ),
);