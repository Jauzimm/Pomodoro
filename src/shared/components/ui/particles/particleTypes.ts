// ============================================================================
// PARTICLE TYPES — Estruturas de dados do motor de partículas
// Camada: Shared UI Utilities
// ============================================================================

export type DepthLayer = 'back' | 'mid' | 'front';

export interface Particle {
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

export interface ParallaxOffset {
  x: number;
  y: number;
}
