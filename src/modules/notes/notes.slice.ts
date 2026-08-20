// ============================================================================
// NOTES SLICE — Bloco de anotações com gravação em disco (debounce externo)
// Camada: Application Logic (Zustand)
// ============================================================================

import type { StateCreator } from 'zustand';

import type { AppStore } from '../../app/store';

export interface NotesSlice {
  note: { content: string; lastUpdated: number };
  setContent: (content: string) => void;
  clearNote: () => void;
}

export const createNotesSlice: StateCreator<
  AppStore,
  [],
  [],
  NotesSlice
> = (set) => ({
  note: { content: '', lastUpdated: 0 },

  setContent: (content) =>
    set({ note: { content, lastUpdated: Date.now() } }),

  clearNote: () => set({ note: { content: '', lastUpdated: Date.now() } }),
});

export const selectNote = (s: NotesSlice) => s.note;