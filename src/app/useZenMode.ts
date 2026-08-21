import { useEffect, useRef, useState } from 'react';

import { selectMode, selectStatus } from '../modules/timer/timer.slice';
import { useStore } from './store';

const ZEN_HIDE_DELAY_MS = 10_000;
const ZEN_CHECK_INTERVAL_MS = 1_000;

/**
 * Modo Zen (auto-hide): durante o ciclo de foco em execução, oculta os
 * controles/menus após 10s de inatividade do mouse, revelando-os no primeiro
 * movimento, clique ou tecla. Fora do foco em execução, nunca esconde.
 */
export function useZenMode(): boolean {
  const mode = useStore(selectMode);
  const status = useStore(selectStatus);
  const [hidden, setHidden] = useState(false);
  const lastActivityRef = useRef(0);

  const zenActive = mode === 'FOCUS' && status === 'RUNNING';

  useEffect(() => {
    const onActivity = () => {
      lastActivityRef.current = performance.now();
      setHidden(false);
    };
    window.addEventListener('pointermove', onActivity, { passive: true });
    window.addEventListener('pointerdown', onActivity);
    window.addEventListener('keydown', onActivity);
    return () => {
      window.removeEventListener('pointermove', onActivity);
      window.removeEventListener('pointerdown', onActivity);
      window.removeEventListener('keydown', onActivity);
    };
  }, []);

  useEffect(() => {
    if (!zenActive) return;
    lastActivityRef.current = performance.now();
    const checkIdle = () => {
      if (performance.now() - lastActivityRef.current >= ZEN_HIDE_DELAY_MS) {
        setHidden(true);
      }
    };
    const id = setInterval(checkIdle, ZEN_CHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [zenActive]);

  useEffect(() => {
    if (hidden) {
      document.body.classList.add('cursor-none');
      return () => document.body.classList.remove('cursor-none');
    }
  }, [hidden]);

  return zenActive && hidden;
}