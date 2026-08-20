// ============================================================================
// SETTINGS SLICE — Notificações e preferências gerais
// Camada: Application Logic (Zustand)
// ============================================================================

import type { StateCreator } from 'zustand';

import type { AppStore } from '../../app/store';
import type { AppLanguage } from '../../shared/i18n/types';
import { detectBrowserLanguage } from '../../shared/i18n/detect';

export interface SettingsSlice {
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
}

export const createSettingsSlice: StateCreator<
  AppStore,
  [],
  [],
  SettingsSlice
> = (set) => ({
  notificationsEnabled: false,
  language: detectBrowserLanguage(),

  setNotificationsEnabled: (notificationsEnabled) =>
    set({ notificationsEnabled }),
  setLanguage: (language) => set({ language }),
});

export const selectNotificationsEnabled = (s: SettingsSlice) => s.notificationsEnabled;
export const selectLanguage = (s: SettingsSlice) => s.language;
