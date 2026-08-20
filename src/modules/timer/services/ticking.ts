// ============================================================================
// TICKING SERVICE — Delta-time com performance.now() para evitar drift
// Camada: Application Logic (serviço de tempo)
//
// Nunca confiamos em setInterval(1000): calculamos o tempo real decorrido entre
// tiques e acumulamos frações, despachando apenas segundos inteiros. Assim, se a
// aba for minimizada (intervalos throttlados a 1s), o relógio continua preciso.
// ============================================================================

export interface TickingController {
  /** Inicia o loop de tiques (no-op se já estiver rodando). */
  start(): void;
  /** Para o loop e zera o estado acumulado. */
  stop(): void;
  /** Reinicia o timestamp de referência (usado ao pausar/retomar). */
  reset(): void;
  isRunning(): boolean;
}

/**
 * Cria um controlador de ticking que invoca `onTick(seconds)` com deltas reais.
 * @param onTick Recebe a quantidade de segundos inteiros decorridos.
 * @param intervalMs Intervalo de checagem (padrão: 250ms).
 */
export function createTickingController(
  onTick: (seconds: number) => void,
  intervalMs = 250,
): TickingController {
  let intervalId: number | null = null;
  let lastTimestamp = 0;
  let accumulated = 0;

  const tick = () => {
    const now = performance.now();
    accumulated += (now - lastTimestamp) / 1000;
    lastTimestamp = now;

    if (accumulated >= 1) {
      const whole = Math.floor(accumulated);
      accumulated -= whole;
      onTick(whole);
    }
  };

  return {
    start() {
      if (intervalId !== null) return;
      lastTimestamp = performance.now();
      accumulated = 0;
      intervalId = window.setInterval(tick, intervalMs);
    },
    stop() {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
      accumulated = 0;
    },
    reset() {
      lastTimestamp = performance.now();
      accumulated = 0;
    },
    isRunning: () => intervalId !== null,
  };
}