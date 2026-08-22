// ============================================================================
// ID UTILS — Gerador de identificadores únicos universais
// Camada: Shared Utils
// ============================================================================

/**
 * Gera um identificador único criptograficamente seguro (UUID v4)
 * com fallback para timestamp + aleatoriedade quando Web Crypto não estiver disponível.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
