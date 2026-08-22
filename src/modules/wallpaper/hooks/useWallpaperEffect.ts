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

/** Validação defensiva de esquema de URL permitido para imagens de wallpaper. */
const SAFE_IMAGE_SRC_REGEX =
  /^(https?:\/\/|\/|data:image\/(png|jpeg|jpg|webp|svg\+xml);base64,)[a-zA-Z0-9+/=._~:/?#[\]@!$&'()*+,;-]+$/;

function sanitizeCssUrl(src: string): string | null {
  if (!SAFE_IMAGE_SRC_REGEX.test(src)) {
    return null;
  }
  // Escapa aspas e quebras de linha para evitar quebra de delimitadores CSS
  const clean = src.replace(/["'\\\n\r]/g, '');
  return `url("${clean}")`;
}

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

    const safeUrl = sanitizeCssUrl(src);
    if (!safeUrl) {
      body.style.backgroundImage = '';
      body.classList.remove('ss-wallpaper');
      return;
    }

    body.style.backgroundImage = `${READABILITY_OVERLAY}, ${safeUrl}`;
    body.classList.add('ss-wallpaper');
  }, [activeWallpaperId, customWallpapers]);
}