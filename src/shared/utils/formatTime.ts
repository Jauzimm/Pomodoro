// ============================================================================
// FORMAT TIME — Formatação de tempo em minutos e segundos
// Camada: Shared Utils
// ============================================================================

export { clamp } from './math';
export { generateId } from './id';

/**
 * Formata um total de segundos no padrão legível `MM:SS`.
 * Garante que valores negativos sejam tratados como zero e suporta durações > 60min.
 *
 * @param totalSeconds Segundos a formatar
 * @returns String formatada no formato "MM:SS"
 */
export function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  const mm = String(minutes);
  const ss = String(seconds).padStart(2, '0');
  return `${mm}:${ss}`;
}
