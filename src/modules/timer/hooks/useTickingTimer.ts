import { useEffect, useRef } from 'react';

import { useStore } from '../../../app/store';
import { createTickingController } from '../services/ticking';
import { selectIsRunning, selectTick } from '../timer.slice';

/**
 * Hook que conecta o ticking (delta-time) ao slice do timer.
 * Só cria o intervalo enquanto o timer estiver em execução; qualquer mudança
 * de modo/pausa derruba e recria o controle (novo timestamp de referência).
 */
export function useTickingTimer(): void {
  const isRunning = useStore(selectIsRunning);
  const tick = useStore(selectTick);
  const controllerRef = useRef<ReturnType<typeof createTickingController> | null>(null);

  useEffect(() => {
    if (!isRunning) return;
    const controller = createTickingController(tick);
    controllerRef.current = controller;
    controller.start();
    return () => {
      controller.stop();
      controllerRef.current = null;
    };
  }, [isRunning, tick]);
}