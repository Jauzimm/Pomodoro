// ============================================================================
// PARTICLE FACTORY — Criação pura de partículas com distribuição de profundidade
// Camada: Shared UI Utilities
// ============================================================================

import type { WallpaperPalette } from '../../../../modules/wallpaper/services/wallpaperColorExtractor';
import type { DepthLayer, Particle } from './particleTypes';

/**
 * Cria uma partícula individual atribuindo camada de profundidade (fundo, médio, primeiro plano),
 * física vertical e rotações aleatórias independentes para cada segmento da cauda.
 */
export function createParticle(
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
    // Plano Médio: tamanho intermediário (5.2px - 7.0px), opacidade e velocidade moderadas
    size = 5.2 + Math.random() * 1.8;
    alpha = 0.45 + Math.random() * 0.22;
    speedY = 0.55 + Math.random() * 0.35;
    parallaxFactor = 0.40 + Math.random() * 0.15;
    numTrail = 3 + Math.floor(Math.random() * 2); // 3 a 4
    spacing = size * 0.62 + 1.0; // Cauda mais junta e compacta
  } else {
    // Primeiro Plano: maiores (7.5px - 9.5px), quase opacos, movimento rápido e alta paralaxe
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

const LAYER_ORDER: Record<DepthLayer, number> = { back: 0, mid: 1, front: 2 };

/**
 * Cria o conjunto inicial de partículas distribuídas e ordenadas por camada de profundidade.
 */
export function createInitialParticles(
  width: number,
  height: number,
  palette: WallpaperPalette,
): Particle[] {
  const count = Math.min(65, Math.max(38, Math.floor((width * height) / 26000)));
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push(createParticle(width, height, palette, false));
  }
  particles.sort((a, b) => LAYER_ORDER[a.layer] - LAYER_ORDER[b.layer]);
  return particles;
}
