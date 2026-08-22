// ============================================================================
// MATH UTILS — Funções matemáticas puras e utilitárias
// Camada: Shared Utils
// ============================================================================

/**
 * Restringe um valor numérico entre um limite mínimo e máximo.
 * @param value Valor a ser limitado
 * @param min Limite inferior
 * @param max Limite superior
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
