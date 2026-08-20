// ============================================================================
// I18N DETECT — Descobre o idioma padrão do navegador
// Camada: Shared (utilitário de aplicação)
// ============================================================================

import type { Language } from './types';

/** Mapeia `navigator.language` (ex: 'en-US') para um dos idiomas suportados. */
export function detectBrowserLanguage(): Language {
  if (typeof navigator === 'undefined') return 'pt';
  const lang = navigator.language?.slice(0, 2).toLowerCase();
  if (lang === 'en') return 'en';
  if (lang === 'es') return 'es';
  return 'pt';
}
