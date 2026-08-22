// ============================================================================
// USE MEDIA QUERY — Hook de consulta de mídia responsiva
// Camada: Shared Hooks
// ============================================================================

import { useSyncExternalStore } from 'react';

/**
 * Hook responsivo utilizando useSyncExternalStore (React 18/19).
 * Elimina re-renders em cascata no mount e garante compatibilidade com SSR.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      if (typeof window === 'undefined' || !window.matchMedia) {
        return () => {};
      }
      const mql = window.matchMedia(query);
      mql.addEventListener('change', callback);
      return () => mql.removeEventListener('change', callback);
    },
    () => {
      if (typeof window === 'undefined' || !window.matchMedia) {
        return false;
      }
      return window.matchMedia(query).matches;
    },
    () => false,
  );
}
