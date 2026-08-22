// ============================================================================
// useAppEffects — Inicialização de todos os serviços e observadores da app
// Camada: Application Logic (hook orquestrador de efeitos)
//
// Separa a responsabilidade de "inicializar serviços" do "renderizar layout".
// App.tsx usa este hook para ligar todos os efeitos sem poluir o componente.
// ============================================================================

import { useAudioController } from '../modules/audio/hooks/useAudioController';
import { useNotifications } from '../modules/settings/hooks/useNotifications';
import { useTaskPomodoroTracking } from '../modules/tasks/hooks/useTaskPomodoroTracking';
import { useTickingTimer } from '../modules/timer/hooks/useTickingTimer';
import { useTimerTitleSync } from '../modules/timer/hooks/useTimerTitleSync';
import { useWallpaperEffect } from '../modules/wallpaper/hooks/useWallpaperEffect';
import { useShortcuts } from './useShortcuts';
import { useZenMode } from './useZenMode';

export interface AppEffectsResult {
  zenHidden: boolean;
}

/**
 * Agrega todos os hooks de efeito da aplicação.
 * Cada hook é independente e desacoplado via slices e event bus.
 */
export function useAppEffects(): AppEffectsResult {
  useTickingTimer();
  useTimerTitleSync();
  useAudioController();
  useTaskPomodoroTracking();
  useNotifications();
  useShortcuts();
  useWallpaperEffect();
  const zenHidden = useZenMode();
  return { zenHidden };
}
