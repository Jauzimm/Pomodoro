// ============================================================================
// SOUND GENERATORS — Utilidades puras para síntese via Web Audio API
// ============================================================================

export type NoiseColor = 'white' | 'pink' | 'brown';

/**
 * Cria um buffer de ruído com a cor desejada.
 * - white: amostras aleatórias uniformes.
 * - pink: filtragem aproximada (Paul Kellet) do ruído branco.
 * - brown: ruído integrado (random walk).
 */
export function createNoiseBuffer(
  ctx: AudioContext,
  color: NoiseColor,
  seconds = 4,
): AudioBuffer {
  const length = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (color === 'white') {
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  let lastOut = 0;
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  let b3 = 0;
  let b4 = 0;
  let b5 = 0;
  let b6 = 0;

  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    if (color === 'pink') {
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    } else {
      // brown: integração com clamp suave
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5;
    }
  }
  return buffer;
}

/** Cria um oscilador com envelope ADSR simples. */
export function createTone(
  ctx: AudioContext,
  dest: AudioNode,
  options: {
    type: OscillatorType;
    frequency: number;
    startAt?: number;
    duration: number;
    attack?: number;
    release?: number;
    volume?: number;
    detune?: number;
  },
): { oscillator: OscillatorNode; gain: GainNode } {
  const { type, frequency, duration, volume = 1 } = options;
  const attack = options.attack ?? 0.005;
  const release = options.release ?? Math.min(0.15, duration / 2);
  const startAt = options.startAt ?? ctx.currentTime + 0.02;

  const targetVol = Math.max(0.0001, volume);

  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startAt);
  if (options.detune) osc.detune.setValueAtTime(options.detune, startAt);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(targetVol, startAt + attack);
  gain.gain.setValueAtTime(targetVol, startAt + duration - release);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  osc.connect(gain);
  gain.connect(dest);

  osc.start(startAt);
  osc.stop(startAt + duration + 0.05);
  return { oscillator: osc, gain };
}

/** Cria um burst de ruído filtrado com envelope exponencial. */
export function createNoiseBurst(
  ctx: AudioContext,
  dest: AudioNode,
  options: {
    color?: NoiseColor;
    frequency: number;
    q?: number;
    duration: number;
    volume?: number;
    startAt?: number;
  },
): void {
  const { frequency, duration, volume = 1 } = options;
  const q = options.q ?? 1;
  const startAt = options.startAt ?? ctx.currentTime + 0.02;
  const targetVol = Math.max(0.0001, volume);

  const buffer = createNoiseBuffer(ctx, options.color ?? 'white', 1);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = frequency;
  filter.Q.value = q;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(targetVol, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(dest);

  src.start(startAt);
  src.stop(startAt + duration + 0.1);
}