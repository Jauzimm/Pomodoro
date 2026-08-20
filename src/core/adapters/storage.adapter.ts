// ============================================================================
// STORAGE ADAPTERS — Persistência genérica com fallback gracioso
// Camada: Infrastructure / Adapters
// ============================================================================

/** Contrato genérico de armazenamento persistente. */
export interface StorageAdapter<T> {
  getItem(): T | null;
  setItem(value: T): void;
  removeItem(): void;
}

/**
 * Implementação padrão baseada em `localStorage` com:
 *  - serialização JSON;
 *  - validação de schema opcional (via validador);
 *  - fallback gracioso em caso de erro de parsing ou cota cheia.
 */
export class LocalStorageAdapter<T> implements StorageAdapter<T> {
  private readonly key: string;
  private readonly validate: ((value: unknown) => value is T) | undefined;

  constructor(
    key: string,
    validate?: (value: unknown) => value is T,
  ) {
    this.key = key;
    this.validate = validate;
  }

  getItem(): T | null {
    try {
      const raw = window.localStorage.getItem(this.key);
      if (raw === null) return null;
      const parsed: unknown = JSON.parse(raw);
      if (this.validate && !this.validate(parsed)) {
        console.warn(`[StorageAdapter] Schema inválido para "${this.key}", ignorando.`);
        return null;
      }
      return parsed as T;
    } catch (error) {
      console.warn(`[StorageAdapter] Falha ao ler "${this.key}":`, error);
      return null;
    }
  }

  setItem(value: T): void {
    try {
      window.localStorage.setItem(this.key, JSON.stringify(value));
    } catch (error) {
      console.warn(`[StorageAdapter] Falha ao gravar "${this.key}" (cota cheia?):`, error);
    }
  }

  removeItem(): void {
    try {
      window.localStorage.removeItem(this.key);
    } catch (error) {
      console.warn(`[StorageAdapter] Falha ao remover "${this.key}":`, error);
    }
  }
}

/** Memória volátil (usada em ambiente sem localStorage / testes). */
export class MemoryStorageAdapter<T> implements StorageAdapter<T> {
  private value: T | null = null;

  getItem(): T | null {
    return this.value;
  }

  setItem(value: T): void {
    this.value = value;
  }

  removeItem(): void {
    this.value = null;
  }
}