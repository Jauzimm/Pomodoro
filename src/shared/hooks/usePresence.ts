import { useEffect, useState } from 'react';

import { useMediaQuery } from './useMediaQuery';

interface Presence {
  /** Elemento deve permanecer montado (mesmo durante a saída animada). */
  mounted: boolean;
  /** Elemento está visível (aplicar estilos "aberto" quando true). */
  visible: boolean;
}

/**
 * Presença animada: mantém o elemento montado por `durationMs` após o
 * fechamento para permitir transições de saída. O estado é sempre alterado
 * em callbacks assíncronos (rAF/timeout), evitando setState síncrono em
 * efeito. Com `prefers-reduced-motion`, fecha imediatamente.
 */
export function usePresence(open: boolean, durationMs = 300): Presence {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (open) {
      const mountId = requestAnimationFrame(() => {
        setMounted(true);
        // Segundo frame: garante que o estado inicial (oculto) já renderizou
        // antes de ligar a transição de entrada.
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(mountId);
    }

    const hideId = requestAnimationFrame(() => setVisible(false));
    // A transição começa um frame após o efeito; um pequeno buffer evita
    // desmontar o elemento antes do fade-out terminar (piscada final).
    const unmountId = setTimeout(() => setMounted(false), reduceMotion ? 0 : durationMs + 60);
    return () => {
      cancelAnimationFrame(hideId);
      clearTimeout(unmountId);
    };
  }, [open, durationMs, reduceMotion]);

  return { mounted, visible };
}