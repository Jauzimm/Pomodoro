// ============================================================================
// APP STORAGE — Bridge entre o persist do Zustand e o StorageAdapter do Core
// ============================================================================

import { createJSONStorage, type PersistStorage } from 'zustand/middleware';

import { LocalStorageAdapter } from '../core/adapters/storage.adapter';
import { STORAGE_KEYS } from '../core/constants';

/** Wrapper do LocalStorageAdapter<string> para o contrato StateStorage do Zustand. */
const adapter = new LocalStorageAdapter<string>(STORAGE_KEYS.appState);

/** Cria o storage JSON tipado para o persist do Zustand (com fallback gracioso). */
export function createAppStorage<T>(): PersistStorage<T> | undefined {
  return createJSONStorage<T>(() => ({
    getItem: () => adapter.getItem(),
    setItem: (_name, value) => adapter.setItem(value),
    removeItem: () => adapter.removeItem(),
  }));
}