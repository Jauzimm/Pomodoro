import { useStore } from './store';
import { useHotkeys } from '../shared/hooks/useHotkeys';

/**
 * Atalhos de teclado globais:
 *  - Espaço: iniciar/pausar o timer
 *  - R: reiniciar a sessão atual
 *  - S: pular para o próximo modo
 */
export function useShortcuts(): void {
  const toggle = useStore((s) => s.toggle);
  const reset = useStore((s) => s.reset);
  const skip = useStore((s) => s.skip);

  useHotkeys(
    {
      ' ': () => toggle(),
      r: () => reset(),
      R: () => reset(),
      s: () => skip(),
      S: () => skip(),
    },
    [toggle, reset, skip],
  );
}