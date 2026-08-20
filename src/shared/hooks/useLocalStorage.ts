import { useCallback, useEffect, useState } from 'react';

/**
 * Hook genérico de persistência em `localStorage` com estado sincronizado.
 * Usa o `LocalStorageAdapter` (core) para leitura/escrita resiliente.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? initialValue : (JSON.parse(raw) as T);
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`[useLocalStorage] Falha ao gravar "${key}":`, error);
    }
  }, [key, value]);

  const remove = useCallback(() => {
    window.localStorage.removeItem(key);
    setValue(initialValue);
  }, [key, initialValue]);

  return [value, setValue, remove] as const;
}