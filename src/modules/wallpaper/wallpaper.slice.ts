// ============================================================================
// WALLPAPER SLICE — Fundo de tela (presets + uploads do usuário)
// Camada: Application Logic (Zustand)
// ============================================================================

import type { StateCreator } from 'zustand';

import type { AppStore } from '../../app/store';

export interface CustomWallpaper {
  id: string;
  name: string;
  /** Data URL (base64) persistida via localStorage. */
  dataUrl: string;
}

export interface WallpaperSlice {
  /** Preset ativo ou id de um wallpaper customizado (null = sem fundo). */
  activeWallpaperId: string | null;
  customWallpapers: CustomWallpaper[];
  setActiveWallpaper: (id: string | null) => void;
  addCustomWallpaper: (name: string, dataUrl: string) => void;
  removeCustomWallpaper: (id: string) => void;
}

const createWallpaperId = () => `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const createWallpaperSlice: StateCreator<
  AppStore,
  [],
  [],
  WallpaperSlice
> = (set) => ({
  activeWallpaperId: null,
  customWallpapers: [],

  setActiveWallpaper: (activeWallpaperId) => set({ activeWallpaperId }),

  addCustomWallpaper: (name, dataUrl) =>
    set((state) => {
      const id = createWallpaperId();
      return {
        customWallpapers: [
          ...state.customWallpapers.slice(-4),
          { id, name, dataUrl },
        ],
        activeWallpaperId: id,
      };
    }),

  removeCustomWallpaper: (id) =>
    set((state) => {
      const customWallpapers = state.customWallpapers.filter((w) => w.id !== id);
      const activeWallpaperId =
        state.activeWallpaperId === id ? null : state.activeWallpaperId;
      return { customWallpapers, activeWallpaperId };
    }),
});

export const selectActiveWallpaperId = (s: WallpaperSlice) => s.activeWallpaperId;
export const selectCustomWallpapers = (s: WallpaperSlice) => s.customWallpapers;