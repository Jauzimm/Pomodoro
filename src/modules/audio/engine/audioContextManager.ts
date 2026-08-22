// ============================================================================
// AUDIO CONTEXT MANAGER — Gerenciamento do ciclo de vida do AudioContext
// Camada: Audio Engine (Infrastructure)
// ============================================================================

/** Singleton lazy do AudioContext nativo. */
let sharedContext: AudioContext | null = null;

/**
 * Obtém ou inicializa a instância singleton do AudioContext.
 * Compatível com prefixos legados WebKit.
 */
export function getAudioContext(): AudioContext {
  if (!sharedContext) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    sharedContext = new Ctor();
  }
  return sharedContext;
}

/**
 * Desbloqueia o AudioContext após o primeiro gesto do usuário (Autoplay Policy).
 */
export function unlockAudioContext(): Promise<void> {
  const ctx = getAudioContext();
  return ctx.state === 'suspended' ? ctx.resume() : Promise.resolve();
}

/**
 * Agenda eventos aleatórios recorrentes enquanto o cancelador não for acionado.
 * Útil para síntese de gotas de chuva, estalos de lareira e ruído de fundo.
 */
export function scheduleRecurring(
  minDelayMs: number,
  maxDelayMs: number,
  handler: () => void,
): () => void {
  let timer = 0;
  let cancelled = false;

  const run = () => {
    if (cancelled) return;
    handler();
    timer = window.setTimeout(
      run,
      minDelayMs + Math.random() * (maxDelayMs - minDelayMs),
    );
  };

  timer = window.setTimeout(run, 100);

  return () => {
    cancelled = true;
    window.clearTimeout(timer);
  };
}
