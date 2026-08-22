// ============================================================================
// PARTICLE CANVAS — Componente de fundo reativo com paralaxe 3D e cores do wallpaper
// Camada: Shared UI Components
// ============================================================================

import { useEffect, useRef } from 'react';
import { useStore } from '../../../app/store';
import { selectParticlesEnabled } from '../../../modules/settings/settings.slice';
import {
  DEFAULT_WALLPAPER_PALETTE,
  PRESET_WALLPAPER_PALETTES,
  extractPredominantColorsFromDataUrl,
  type WallpaperPalette,
} from '../../../modules/wallpaper/services/wallpaperColorExtractor';
import { createInitialParticles } from './particles/particleFactory';
import { renderParticleFrame } from './particles/particleRenderer';
import type { ParallaxOffset, Particle } from './particles/particleTypes';

/**
 * Canvas de partículas em background com cores dinâmicas sincronizadas ao wallpaper ativo,
 * rotação individual de cauda e profundidade 3D em camadas.
 */
export function ParticleCanvas() {
  const enabled = useStore(selectParticlesEnabled);
  const activeWallpaperId = useStore((s) => s.activeWallpaperId);
  const customWallpapers = useStore((s) => s.customWallpapers);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const paletteRef = useRef<WallpaperPalette>(DEFAULT_WALLPAPER_PALETTE);
  const particlesRef = useRef<Particle[]>([]);

  // Sincronização dinâmica da paleta de 3 cores com o wallpaper ativo
  useEffect(() => {
    if (!activeWallpaperId) {
      paletteRef.current = DEFAULT_WALLPAPER_PALETTE;
      return;
    }

    if (activeWallpaperId in PRESET_WALLPAPER_PALETTES) {
      paletteRef.current = PRESET_WALLPAPER_PALETTES[activeWallpaperId];
      return;
    }

    const custom = customWallpapers.find((w) => w.id === activeWallpaperId);
    if (custom?.dataUrl) {
      let isCurrent = true;
      extractPredominantColorsFromDataUrl(custom.dataUrl).then((pal) => {
        if (isCurrent) {
          paletteRef.current = pal;
        }
      });
      return () => {
        isCurrent = false;
      };
    }

    paletteRef.current = DEFAULT_WALLPAPER_PALETTE;
  }, [activeWallpaperId, customWallpapers]);

  useEffect(() => {
    if (!enabled) return;

    // Respeita acessibilidade (prefers-reduced-motion)
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId = 0;
    let width = 0;
    let height = 0;

    // Estado da paralaxe com inércia
    const targetParallax: ParallaxOffset = { x: 0, y: 0 };
    const currentParallax: ParallaxOffset = { x: 0, y: 0 };

    const initSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      particlesRef.current = createInitialParticles(width, height, paletteRef.current);
    };

    initSize();

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min(32, now - lastTime);
      lastTime = now;
      const speedFactor = dt / 16.6;

      // Interpolação suave da paralaxe (amortecimento com inércia sedosa)
      currentParallax.x += (targetParallax.x - currentParallax.x) * 0.035;
      currentParallax.y += (targetParallax.y - currentParallax.y) * 0.035;

      renderParticleFrame(
        ctx,
        particlesRef.current,
        paletteRef.current,
        currentParallax,
        width,
        height,
        speedFactor,
      );

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const handlePointerMove = (e: PointerEvent) => {
      const normX = (e.clientX - width / 2) / (width / 2);
      const normY = (e.clientY - height / 2) / (height / 2);
      targetParallax.x = normX * 12;
      targetParallax.y = normY * 7;
    };

    const handlePointerLeave = () => {
      targetParallax.x = 0;
      targetParallax.y = 0;
    };

    const handleResize = () => {
      initSize();
    };

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else {
        lastTime = performance.now();
        animId = requestAnimationFrame(render);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-90 transition-opacity duration-700 dark:opacity-100"
    />
  );
}
