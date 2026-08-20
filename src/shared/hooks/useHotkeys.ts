import { useEffect } from 'react';

type HotkeyMap = Partial<
  Record<KeyboardEvent['key'], (e: KeyboardEvent) => void>
>;

/**
 * Registra atalhos de teclado globais.
 * Ex.: { ' ': togglePlay, 'Escape': closeModal }.
 */
export function useHotkeys(handlers: HotkeyMap, deps: unknown[] = []): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditable =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable;

      // Nunca captura atalhos enquanto o usuário digita em um campo.
      // Botões focados já respondem nativamente a Espaço/Enter (evita duplo disparo).
      if (isEditable || target?.closest('button')) return;

      const handler = handlers[event.key];
      if (handler) {
        event.preventDefault();
        handler(event);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}