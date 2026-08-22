import { useEffect, useRef } from 'react';
import { useStore } from '../../../app/store';
import { selectParticlesEnabled } from '../../../modules/settings/settings.slice';
import {
  DEFAULT_WALLPAPER_PALETTE,
  PRESET_WALLPAPER_PALETTES,
  extractPredominantColorsFromDataUrl,
  type WallpaperPalette,
} from '../../../modules/wallpaper/services/wallpaperColorExtractor';

type DepthLayer = 'back' | 'mid' | 'front';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  angle: number;
  rotSpeed: number;
  trailAngles: number[];
  trailRotSpeeds: number[];
  layer: DepthLayer;
  parallaxFactor: number;
  numTrail: number;
  spacing: number;
  r: number;
  g: number;
  b: number;
  alpha: number;
}

function createParticle(
  w: number,
  h: number,
  palette: WallpaperPalette,
  spawnAtBottom = false,
  forceLayer?: DepthLayer,
): Particle {
  const color = palette[Math.floor(Math.random() * palette.length)];

  // Distribuição de profundidade: 45% fundo, 35% médio, 20% primeiro plano
  let layer: DepthLayer = forceLayer ?? 'mid';
  if (!forceLayer) {
    const rand = Math.random();
    if (rand < 0.45) layer = 'back';
    else if (rand < 0.80) layer = 'mid';
    else layer = 'front';
  }

  let size = 3.5;
  let alpha = 0.25;
  let speedY = 0.35;
  let parallaxFactor = 0.25;
  let numTrail = 3;
  let spacing = 3;

  if (layer === 'back') {
    // Fundo: menores (3.0px - 4.5px), baixa opacidade, movimento lento e leve paralaxe
    size = 3.0 + Math.random() * 1.5;
    alpha = 0.20 + Math.random() * 0.18;
    speedY = 0.25 + Math.random() * 0.25;
    parallaxFactor = 0.15 + Math.random() * 0.10;
    numTrail = 2 + Math.floor(Math.random() * 2); // 2 a 3
    spacing = size * 0.58 + 0.8; // Cauda mais junta e compacta
  } else if (layer === 'mid') {
    // Plano Médio: tamanho intermediário (+2px: 5.2px - 7.0px), opacidade e velocidade moderadas
    size = 5.2 + Math.random() * 1.8;
    alpha = 0.45 + Math.random() * 0.22;
    speedY = 0.55 + Math.random() * 0.35;
    parallaxFactor = 0.40 + Math.random() * 0.15;
    numTrail = 3 + Math.floor(Math.random() * 2); // 3 a 4
    spacing = size * 0.62 + 1.0; // Cauda mais junta e compacta
  } else {
    // Primeiro Plano: maiores (+4px: 7.5px - 9.5px), quase opacos, movimento rápido e alta paralaxe
    size = 7.5 + Math.random() * 2.0;
    alpha = 0.75 + Math.random() * 0.22;
    speedY = 0.90 + Math.random() * 0.50;
    parallaxFactor = 0.75 + Math.random() * 0.20;
    numTrail = 4 + Math.floor(Math.random() * 2); // 4 a 5
    spacing = size * 0.68 + 1.2; // Cauda mais junta e compacta
  }

  // Cada quadrado da cauda possui ângulo inicial e velocidade de rotação independentes em sentidos aleatórios
  const trailAngles: number[] = [];
  const trailRotSpeeds: number[] = [];
  for (let k = 0; k < numTrail; k++) {
    trailAngles.push(Math.random() * Math.PI * 2);
    // Sentido aleatório (positivo/negativo) com velocidade de rotação viva
    const dir = Math.random() > 0.5 ? 1 : -1;
    trailRotSpeeds.push(dir * (0.02 + Math.random() * 0.035));
  }

  return {
    x: Math.random() * w,
    y: spawnAtBottom ? h + Math.random() * 50 : Math.random() * h,
    size,
    speedY,
    angle: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() > 0.5 ? 1 : -1) * (0.015 + Math.random() * 0.03),
    trailAngles,
    trailRotSpeeds,
    layer,
    parallaxFactor,
    numTrail,
    spacing,
    r: color.r,
    g: color.g,
    b: color.b,
    alpha,
  };
}

/**
 * Canvas de partículas em background com cores sincronizadas ao wallpaper ativo,
 * rotação independente para cada quadrado da cauda em sentidos aleatórios
 * e paralaxe 3D em camadas de profundidade.
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
    const targetParallax = { x: 0, y: 0 };
    const currentParallax = { x: 0, y: 0 };

    const initSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      // Quantidade total balanceada (40 a 65 partículas)
      const count = Math.min(65, Math.max(38, Math.floor((width * height) / 26000)));
      
      const newParticles: Particle[] = [];
      const currentPal = paletteRef.current;
      for (let i = 0; i < count; i++) {
        newParticles.push(createParticle(width, height, currentPal, false));
      }

      // Ordena por profundidade para renderizar fundo -> plano médio -> primeiro plano
      const layerOrder: Record<DepthLayer, number> = { back: 0, mid: 1, front: 2 };
      newParticles.sort((a, b) => layerOrder[a.layer] - layerOrder[b.layer]);

      particlesRef.current = newParticles;
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

      ctx.clearRect(0, 0, width, height);
      const particles = particlesRef.current;
      const curPalette = paletteRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Atualização da rotação do quadrado principal
        p.angle += p.rotSpeed * speedFactor;
        p.y -= p.speedY * speedFactor;

        // Atualização dinâmica da rotação individual dos quadrados da cauda
        for (let k = 0; k < p.trailAngles.length; k++) {
          p.trailAngles[k] += p.trailRotSpeeds[k] * speedFactor;
        }

        // Reset quando sai pelo topo (recicla com as 3 cores ativas do wallpaper)
        const totalTailHeight = p.numTrail * p.spacing;
        if (p.y < -totalTailHeight - 20) {
          const fresh = createParticle(width, height, curPalette, true, p.layer);
          particles[i] = fresh;
          continue;
        }

        // Posição ajustada pelo deslocamento de paralaxe da camada
        const drawX = p.x + currentParallax.x * p.parallaxFactor;
        const drawY = p.y + currentParallax.y * p.parallaxFactor;

        // 1) Renderiza a cauda em fade (quadrados decrescentes com rotação independente e aleatória)
        for (let k = p.numTrail; k >= 1; k--) {
          const progress = 1 - k / (p.numTrail + 1);
          const segSize = p.size * (0.35 + 0.55 * progress);
          const segAlpha = p.alpha * Math.pow(progress, 1.15) * 0.8;
          const halfSeg = segSize / 2;

          const trailY = drawY + k * p.spacing;
          const trailAngle = p.trailAngles[k - 1] ?? p.angle;

          ctx.save();
          ctx.translate(drawX, trailY);
          ctx.rotate(trailAngle);
          ctx.fillStyle = 'rgba(' + p.r + ', ' + p.g + ', ' + p.b + ', ' + segAlpha.toFixed(3) + ')';
          ctx.fillRect(-halfSeg, -halfSeg, segSize, segSize);
          ctx.restore();
        }

        // 2) Renderiza o quadrado principal
        const half = p.size / 2;
        ctx.save();
        ctx.translate(drawX, drawY);
        ctx.rotate(p.angle);

        // Preenchimento com a cor correspondente do wallpaper (sem bordas)
        ctx.fillStyle = 'rgba(' + p.r + ', ' + p.g + ', ' + p.b + ', ' + p.alpha.toFixed(3) + ')';
        ctx.fillRect(-half, -half, p.size, p.size);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const handlePointerMove = (e: PointerEvent) => {
      // Calcula deslocamento relativo ao centro da tela (-1 a 1) com amplitude sutil
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
