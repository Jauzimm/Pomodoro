// ============================================================================
// STORE — Store Zustand unificado (slices desacoplados + persistência com schema)
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
import { sanitizePersistedState } from './schema/stateMigration';

export interface AppStore
  extends TimerSlice,
    TasksSlice,
    NotesSlice,
    AudioSlice,
    SettingsSlice,
    WallpaperSlice {}

/** Subconjunto persistido em disco (o timer em execução nunca é salvo). */
export interface PersistedState {
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
  merge: (persisted, current) => sanitizePersistedState(persisted, current),
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
