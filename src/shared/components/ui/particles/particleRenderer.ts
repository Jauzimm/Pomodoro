// ============================================================================
// PARTICLE RENDERER — Renderizador canvas puro (atualização física + desenho)
// Camada: Shared UI Utilities
// ============================================================================

import type { WallpaperPalette } from '../../../../modules/wallpaper/services/wallpaperColorExtractor';
import { createParticle } from './particleFactory';
import type { ParallaxOffset, Particle } from './particleTypes';

/**
 * Atualiza e renderiza todos os quadrados de partículas e suas caudas em cascata.
 */
export function renderParticleFrame(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  curPalette: WallpaperPalette,
  currentParallax: ParallaxOffset,
  width: number,
  height: number,
  speedFactor: number,
): void {
  ctx.clearRect(0, 0, width, height);

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
      particles[i] = createParticle(width, height, curPalette, true, p.layer);
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
      ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${segAlpha.toFixed(3)})`;
      ctx.fillRect(-halfSeg, -halfSeg, segSize, segSize);
      ctx.restore();
    }

    // 2) Renderiza o quadrado principal
    const half = p.size / 2;
    ctx.save();
    ctx.translate(drawX, drawY);
    ctx.rotate(p.angle);

    // Preenchimento com a cor correspondente do wallpaper (sem bordas)
    ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${p.alpha.toFixed(3)})`;
    ctx.fillRect(-half, -half, p.size, p.size);
    ctx.restore();
  }
}
