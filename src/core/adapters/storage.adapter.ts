// ============================================================================
// STORAGE ADAPTERS — Persistência genérica desacoplada (Adapter Pattern)
// Camada: Infrastructure / Adapters
// ============================================================================

/**
 * Contrato genérico de armazenamento persistente (Port).
 */
export interface StorageAdapter<T> {
  getItem(): T | null;
  setItem(value: T): void;
  removeItem(): void;
}

/**
 * Adaptador baseado em `window.localStorage` com serialização JSON e tratamento defensivo.
 * Suporta validação opcional de schema e não lança exceções se o ambiente for SSR ou a cota estiver cheia.
 */
export class LocalStorageAdapter<T> implements StorageAdapter<T> {
  private readonly key: string;
  private readonly validate?: (value: unknown) => value is T;

  constructor(key: string, validate?: (value: unknown) => value is T) {
    this.key = key;
    this.validate = validate;
  }

  getItem(): T | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }

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
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    try {
      window.localStorage.setItem(this.key, JSON.stringify(value));
    } catch (error) {
      console.warn(`[StorageAdapter] Falha ao gravar "${this.key}" (cota cheia?):`, error);
    }
  }

  removeItem(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    try {
      window.localStorage.removeItem(this.key);
    } catch (error) {
      console.warn(`[StorageAdapter] Falha ao remover "${this.key}":`, error);
    }
  }
}

/**
 * Adaptador em memória volátil (utilizado em testes unitários ou ambientes sem localStorage).
 */
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

/**
 * Adaptador bruto de string para integração direta com middleware de persistência externa (ex: Zustand).
 * Evita dupla serialização JSON.
 */
export class RawLocalStorageAdapter implements StorageAdapter<string> {
  private readonly key: string;

  constructor(key: string) {
    this.key = key;
  }

  getItem(): string | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    try {
      return window.localStorage.getItem(this.key);
    } catch (error) {
      console.warn(`[RawStorageAdapter] Falha ao ler "${this.key}":`, error);
      return null;
    }
  }

  setItem(value: string): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(this.key, value);
    } catch (error) {
      console.warn(`[RawStorageAdapter] Falha ao gravar "${this.key}":`, error);
    }
  }

  removeItem(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.removeItem(this.key);
    } catch (error) {
      console.warn(`[RawStorageAdapter] Falha ao remover "${this.key}":`, error);
    }
  }
}
