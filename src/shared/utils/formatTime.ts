/** Formata segundos no padrão `MM:SS` (minutos podem passar de 60, ex.: 60:00). */
export function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  const mm = String(minutes);
  const ss = String(seconds).padStart(2, '0');
  return `${mm}:${ss}`;
}

/** Gera um id único (crypto.randomUUID com fallback). */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Clamp simples. */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));