// ============================================================================
// AUDIO SLICE — Configurações de alarme + ambiente (volume, mute, tipo)
// Camada: Application Logic (Zustand)
// ============================================================================

import type { StateCreator } from 'zustand';

import type { AppStore } from '../../app/store';
import type {
  AmbientSoundType,
  AudioSettings,
  SoundAlertPreset,
} from '../../core/types/domain';

export interface AudioSlice {
  audio: AudioSettings;
  setAlertSound: (sound: SoundAlertPreset) => void;
  setAlertVolume: (volume: number) => void;
  setAmbientType: (type: AmbientSoundType | null) => void;
  setAmbientVolume: (volume: number) => void;
  toggleMute: () => void;
}

export const createAudioSlice: StateCreator<
  AppStore,
  [],
  [],
  AudioSlice
> = (set) => ({
  audio: {
    alertSound: 'TIBETAN_BOWL',
    alertVolume: 0.6,
    ambientType: null,
    ambientVolume: 0.4,
    isMuted: false,
  },

  setAlertSound: (alertSound) =>
    set((state) => ({ audio: { ...state.audio, alertSound } })),

  setAlertVolume: (alertVolume) =>
    set((state) => ({
      audio: { ...state.audio, alertVolume },
    })),

  setAmbientType: (ambientType) =>
    set((state) => ({ audio: { ...state.audio, ambientType } })),

  setAmbientVolume: (ambientVolume) =>
    set((state) => ({ audio: { ...state.audio, ambientVolume } })),

  toggleMute: () =>
    set((state) => ({ audio: { ...state.audio, isMuted: !state.audio.isMuted } })),
});

export const selectAudio = (s: AudioSlice) => s.audio;
export const selectAmbientType = (s: AudioSlice) => s.audio.ambientType;
export const selectIsMuted = (s: AudioSlice) => s.audio.isMuted;