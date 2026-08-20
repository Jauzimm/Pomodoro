// ============================================================================
// WALLPAPER PRESETS — Wallpapers padrão empacotados com a aplicação
// Camada: Application Logic (metadados de UI, sem lógica)
// ============================================================================

export interface WallpaperPreset {
  id: string;
  name: string;
  /** Caminho público do asset (SVG leve, sem dependência externa). */
  src: string;
}

/** Grade de fundos padrão exibida no seletor (ordem de apresentação). */
export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  { id: 'aurora', name: 'Aurora', src: '/wallpapers/aurora.svg' },
  { id: 'ocean', name: 'Oceano', src: '/wallpapers/ocean.svg' },
  { id: 'sunset', name: 'Pôr do Sol', src: '/wallpapers/sunset.svg' },
  { id: 'forest', name: 'Floresta', src: '/wallpapers/forest.svg' },
  { id: 'midnight', name: 'Meia-noite', src: '/wallpapers/midnight.svg' },
  { id: 'sand', name: 'Deserto', src: '/wallpapers/sand.svg' },
];

/** Limite de wallpapers customizados persistidos (localStorage tem ~5MB). */
export const MAX_CUSTOM_WALLPAPERS = 5;
/** Tamanho máximo por imagem customizada (data URL base64). */
export const MAX_CUSTOM_WALLPAPER_BYTES = 2 * 1024 * 1024;