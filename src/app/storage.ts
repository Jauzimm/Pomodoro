// ============================================================================
// APP STORAGE — Bridge entre o persist do Zustand e o StorageAdapter do Core
// Camada: Application Infrastructure
// ============================================================================

import { createJSONStorage, type PersistStorage } from 'zustand/middleware';

import { RawLocalStorageAdapter } from '../core/adapters/storage.adapter';
import { STORAGE_KEYS } from '../core/constants';

/** Adaptador de chave fixa para armazenamento do estado do app. */
const rawAdapter = new RawLocalStorageAdapter(STORAGE_KEYS.appState);

/**
 * Cria o storage JSON tipado para o middleware `persist` do Zustand.
 * Integração direta via RawLocalStorageAdapter sem dupla serialização JSON.
 */
export function createAppStorage<T>(): PersistStorage<T> | undefined {
  return createJSONStorage<T>(() => ({
    getItem: () => rawAdapter.getItem(),
    setItem: (_name, value) => rawAdapter.setItem(value),
    removeItem: () => rawAdapter.removeItem(),
  }));
}
