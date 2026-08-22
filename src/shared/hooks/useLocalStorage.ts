// ============================================================================
// USE LOCAL STORAGE — Hook genérico de persistência local
// Camada: Shared Hooks
// ============================================================================

import { useCallback, useEffect, useState } from 'react';

/**
 * Hook genérico de persistência em `localStorage` com estado reativo e segurança contra SSR.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return initialValue;
    }
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? initialValue : (JSON.parse(raw) as T);
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`[useLocalStorage] Falha ao gravar "${key}":`, error);
    }
  }, [key, value]);

  const remove = useCallback(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(key);
      } catch (error) {
        console.warn(`[useLocalStorage] Falha ao remover "${key}":`, error);
      }
    }
    setValue(initialValue);
  }, [key, initialValue]);

  return [value, setValue, remove] as const;
}
