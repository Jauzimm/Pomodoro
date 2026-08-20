// ============================================================================
// WALLPAPER EFFECT — Aplica o fundo selecionado ao <body>
// Camada: Application Logic (efeito no DOM, reflete o fundo ativo no body)
// ============================================================================

import { useEffect } from 'react';

import { useStore } from '../../../app/store';
import { WALLPAPER_PRESETS } from '../presets';

/** Sombra de legibilidade sobre qualquer imagem (funciona nos dois temas). */
const READABILITY_OVERLAY =
  'linear-gradient(rgba(9, 9, 11, 0.35), rgba(9, 9, 11, 0.45))';

/**
 * Sincroniza o wallpaper ativo com o fundo do documento.
 * Resolve o src (preset ou upload custom) e define `background-image` no body;
 * sem seleção, remove o estilo e a classe utilitária.
 */
export function useWallpaperEffect(): void {
  const activeWallpaperId = useStore((s) => s.activeWallpaperId);
  const customWallpapers = useStore((s) => s.customWallpapers);

  useEffect(() => {
    const body = document.body;

    const preset = WALLPAPER_PRESETS.find((p) => p.id === activeWallpaperId);
    const custom = customWallpapers.find((w) => w.id === activeWallpaperId);
    const src = preset?.src ?? custom?.dataUrl ?? null;

    if (!src) {
      body.style.backgroundImage = '';
      body.classList.remove('ss-wallpaper');
      return;
    }

    body.style.backgroundImage = `${READABILITY_OVERLAY}, url("${src}")`;
    body.classList.add('ss-wallpaper');
  }, [activeWallpaperId, customWallpapers]);
}