// ============================================================================
// COLOR QUANTIZER — Algoritmo puro de quantização e extração de paleta cromática
// Camada: Wallpaper Services (Pure Domain Utility)
// ============================================================================

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export type WallpaperPalette = [RGB, RGB, RGB];

interface ColorBucket {
  r: number;
  g: number;
  b: number;
  count: number;
}

/**
 * Calcula a distância euclidiana perceptual entre duas cores no espaço RGB.
 */
export function colorDistance(c1: RGB, c2: RGB): number {
  return Math.hypot(c1.r - c2.r, c1.g - c2.g, c1.b - c2.b);
}

/**
 * Extrai as cores dominantes e vibrantes de um conjunto de pixels RGBA.
 *
 * @param pixelData Array de bytes de imagem (RGBA ordenados)
 * @param minDistinctDistance Distância euclidiana mínima entre as cores extraídas (default: 42)
 * @param fallbackPalette Paleta de reserva para preencher posições caso a imagem tenha poucas cores
 */
export function quantizeDominantColors(
  pixelData: Uint8ClampedArray,
  fallbackPalette: WallpaperPalette,
  minDistinctDistance = 42,
): WallpaperPalette {
  const buckets = new Map<string, ColorBucket>();

  for (let i = 0; i < pixelData.length; i += 4) {
    const r = pixelData[i];
    const g = pixelData[i + 1];
    const b = pixelData[i + 2];
    const a = pixelData[i + 3];

    // Ignora pixels transparentes ou semitransparentes
    if (a < 128) continue;

    const brightness = (r + g + b) / 3;
    // Ignora pixels excessivamente escuros para que as partículas tenham bom contraste
    if (brightness < 30) continue;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max - min;
    // Ponderação: cores mais saturadas recebem maior peso no histograma
    const weight = 1 + (sat / 255) * 2.5;

    // Agrupamento em quantização de 4 bits por canal (16 níveis por cor)
    const qr = (r >> 4) << 4;
    const qg = (g >> 4) << 4;
    const qb = (b >> 4) << 4;
    const key = `${qr},${qg},${qb}`;

    const existing = buckets.get(key);
    if (existing) {
      existing.r += r * weight;
      existing.g += g * weight;
      existing.b += b * weight;
      existing.count += weight;
    } else {
      buckets.set(key, { r: r * weight, g: g * weight, b: b * weight, count: weight });
    }
  }

  const sortedBuckets = Array.from(buckets.values()).sort((a, b) => b.count - a.count);
  const colors: RGB[] = [];

  for (const bucket of sortedBuckets) {
    const avgR = Math.round(bucket.r / bucket.count);
    const avgG = Math.round(bucket.g / bucket.count);
    const avgB = Math.round(bucket.b / bucket.count);
    const candidate: RGB = { r: avgR, g: avgG, b: avgB };

    const isDistinct = colors.every((c) => colorDistance(c, candidate) > minDistinctDistance);
    if (isDistinct) {
      colors.push(candidate);
      if (colors.length >= 3) break;
    }
  }

  // Completa com cores do fallback caso não encontre 3 cores suficientemente distintas
  while (colors.length < 3) {
    colors.push(fallbackPalette[colors.length]);
  }

  return [colors[0], colors[1], colors[2]];
}
