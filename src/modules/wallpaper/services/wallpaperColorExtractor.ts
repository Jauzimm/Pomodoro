// ============================================================================
// WALLPAPER COLOR EXTRACTOR — Extrai as 3 cores predominantes do wallpaper ativo
// Camada: Application Logic (serviço de paleta para efeitos visuais)
// ============================================================================

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export type WallpaperPalette = [RGB, RGB, RGB];

/** Paleta padrão (quando nenhum wallpaper está ativo — tema escuro padrão). */
export const DEFAULT_WALLPAPER_PALETTE: WallpaperPalette = [
  { r: 129, g: 140, b: 248 }, // Indigo 400 (#818cf8)
  { r: 192, g: 132, b: 252 }, // Violet 400 (#c084fc)
  { r: 244, g: 244, b: 245 }, // Zinc 100 (#f4f4f5)
];

/** 3 cores predominantes calibradas para cada um dos presets SVG empacotados. */
export const PRESET_WALLPAPER_PALETTES: Record<string, WallpaperPalette> = {
  aurora: [
    { r: 52, g: 211, b: 153 },  // Emerald 400 (#34d399)
    { r: 129, g: 140, b: 248 }, // Indigo 400 (#818cf8)
    { r: 244, g: 114, b: 182 }, // Pink 400 (#f472b6)
  ],
  ocean: [
    { r: 103, g: 232, b: 249 }, // Cyan 300 (#67e8f9)
    { r: 56, g: 189, b: 248 },  // Sky 400 (#38bdf8)
    { r: 45, g: 212, b: 191 },  // Teal 400 (#2dd4bf)
  ],
  sunset: [
    { r: 253, g: 224, b: 71 },  // Yellow 300 (#fde047)
    { r: 251, g: 146, b: 60 },  // Orange 400 (#fb923c)
    { r: 244, g: 63, b: 94 },   // Rose 500 (#f43f5e)
  ],
  forest: [
    { r: 167, g: 243, b: 208 }, // Emerald 200 (#a7f3d0)
    { r: 52, g: 211, b: 153 },  // Emerald 400 (#34d399)
    { r: 74, g: 222, b: 128 },  // Green 400 (#4ade80)
  ],
  midnight: [
    { r: 226, g: 232, b: 240 }, // Slate 200 (#e2e8f0)
    { r: 147, g: 197, b: 253 }, // Blue 300 (#93c5fd)
    { r: 167, g: 139, b: 250 }, // Purple 400 (#a78bfa)
  ],
  sand: [
    { r: 253, g: 230, b: 138 }, // Amber 200 (#fde68a)
    { r: 245, g: 158, b: 11 },  // Amber 500 (#f59e0b)
    { r: 251, g: 146, b: 60 },  // Orange 400 (#fb923c)
  ],
};

const paletteCache = new Map<string, WallpaperPalette>();

/**
 * Extrai dinamicamente as 3 cores mais predominantes e vibrantes de uma imagem base64 / dataUrl.
 * Executa uma amostragem rápida (64x64) com quantização e cálculo de saturação.
 */
export function extractPredominantColorsFromDataUrl(dataUrl: string): Promise<WallpaperPalette> {
  const cached = paletteCache.get(dataUrl);
  if (cached) return Promise.resolve(cached);

  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve(DEFAULT_WALLPAPER_PALETTE);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 64;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(DEFAULT_WALLPAPER_PALETTE);
          return;
        }

        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          if (a < 128) continue;

          const brightness = (r + g + b) / 3;
          // Ignora pixels excessivamente escuros para que as partículas tenham contraste e brilho
          if (brightness < 30) continue;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const sat = max - min;
          const weight = 1 + (sat / 255) * 2.5;

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

        const sorted = Array.from(buckets.values()).sort((a, b) => b.count - a.count);
        const colors: RGB[] = [];

        for (const bucket of sorted) {
          const avgR = Math.round(bucket.r / bucket.count);
          const avgG = Math.round(bucket.g / bucket.count);
          const avgB = Math.round(bucket.b / bucket.count);

          const isDistinct = colors.every((c) => Math.hypot(c.r - avgR, c.g - avgG, c.b - avgB) > 42);
          if (isDistinct) {
            colors.push({ r: avgR, g: avgG, b: avgB });
            if (colors.length >= 3) break;
          }
        }

        while (colors.length < 3) {
          colors.push(DEFAULT_WALLPAPER_PALETTE[colors.length]);
        }

        const result: WallpaperPalette = [colors[0], colors[1], colors[2]];
        paletteCache.set(dataUrl, result);
        resolve(result);
      } catch {
        resolve(DEFAULT_WALLPAPER_PALETTE);
      }
    };

    img.onerror = () => resolve(DEFAULT_WALLPAPER_PALETTE);
    img.src = dataUrl;
  });
}
