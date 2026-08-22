// ============================================================================
// AMBIENT GENERATORS — Motores de síntese procedural de sons ambientes
// Camada: Audio Engine (Infrastructure)
// ============================================================================

import {
  createNoiseBuffer,
  createNoiseBurst,
  createTone,
} from '../../../shared/utils/soundGenerators';
import { scheduleRecurring } from './audioContextManager';

export interface AmbientHandle {
  stop(): void;
}

// Progressão harmônica Lo-Fi: Am7 -> Fmaj7 -> Cmaj7 -> G
const LOFI_CHORDS: number[][] = [
  [110, 130.81, 164.81, 196.0], // Am7
  [87.31, 110.0, 130.81, 164.81], // Fmaj7
  [130.81, 164.81, 196.0, 246.94], // Cmaj7
  [98.0, 123.47, 146.83], // G
];

/**
 * Construtor do som de Ruído Marrom (Brown Noise): filtragem passa-baixas com ênfase em graves.
 */
export function buildBrownNoise(ctx: AudioContext, dest: AudioNode): AmbientHandle {
  const buffer = createNoiseBuffer(ctx, 'brown');
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 1200;

  const gain = ctx.createGain();
  gain.gain.value = 0.5;

  src.connect(lowpass);
  lowpass.connect(gain);
  gain.connect(dest);
  src.start();

  return {
    stop: () => {
      src.stop();
      src.disconnect();
    },
  };
}

/**
 * Construtor do som de Chuva: manto de ruído branco filtrado com gotas aleatórias.
 */
export function buildRain(ctx: AudioContext, dest: AudioNode): AmbientHandle {
  const buffer = createNoiseBuffer(ctx, 'white');
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;

  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = 350;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 2400;

  const gain = ctx.createGain();
  gain.gain.value = 0.5;

  src.connect(highpass);
  highpass.connect(lowpass);
  lowpass.connect(gain);
  gain.connect(dest);
  src.start();

  const cancel = scheduleRecurring(120, 700, () => {
    createNoiseBurst(ctx, dest, {
      color: 'white',
      frequency: 3200 + Math.random() * 2600,
      q: 1.4,
      duration: 0.05 + Math.random() * 0.04,
      volume: 0.05 + Math.random() * 0.06,
    });
  });

  return {
    stop: () => {
      src.stop();
      src.disconnect();
      cancel();
    },
  };
}

/**
 * Construtor do som de Cafeteria: ruído rosa com bursts simulando murmurinho e ambiente.
 */
export function buildCafe(ctx: AudioContext, dest: AudioNode): AmbientHandle {
  const buffer = createNoiseBuffer(ctx, 'brown');
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = 420;
  bandpass.Q.value = 0.7;

  const gain = ctx.createGain();
  gain.gain.value = 0.5;

  src.connect(bandpass);
  bandpass.connect(gain);
  gain.connect(dest);
  src.start();

  const cancel = scheduleRecurring(400, 1900, () => {
    createNoiseBurst(ctx, dest, {
      color: 'pink',
      frequency: 700 + Math.random() * 700,
      q: 2.5,
      duration: 0.25 + Math.random() * 0.45,
      volume: 0.05 + Math.random() * 0.05,
    });
  });

  return {
    stop: () => {
      src.stop();
      src.disconnect();
      cancel();
    },
  };
}

/**
 * Construtor do som de Lareira: ruído rosa grave com estalos de lenha de alta frequência.
 */
export function buildFireplace(ctx: AudioContext, dest: AudioNode): AmbientHandle {
  const buffer = createNoiseBuffer(ctx, 'pink');
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 320;

  const gain = ctx.createGain();
  gain.gain.value = 0.55;

  src.connect(lowpass);
  lowpass.connect(gain);
  gain.connect(dest);
  src.start();

  const cancel = scheduleRecurring(150, 1400, () => {
    createNoiseBurst(ctx, dest, {
      color: 'white',
      frequency: 2500 + Math.random() * 3000,
      q: 0.8,
      duration: 0.02 + Math.random() * 0.05,
      volume: 0.12 + Math.random() * 0.18,
    });
  });

  return {
    stop: () => {
      src.stop();
      src.disconnect();
      cancel();
    },
  };
}

/**
 * Construtor do som Lo-Fi: gerador polifônico de acordes com osciladores levemente detunados,
 * crackle de vinil contínuo e scheduler lookahead.
 */
export function buildLofi(ctx: AudioContext, dest: AudioNode): AmbientHandle {
  const padGain = ctx.createGain();
  padGain.gain.value = 0.5;
  padGain.connect(dest);

  const bassGain = ctx.createGain();
  bassGain.gain.value = 0.4;
  bassGain.connect(dest);

  const crackleGain = ctx.createGain();
  crackleGain.gain.value = 0.3;
  crackleGain.connect(dest);

  const padFilter = ctx.createBiquadFilter();
  padFilter.type = 'lowpass';
  padFilter.frequency.value = 1400;
  padFilter.Q.value = 0.6;

  let chordIndex = 0;
  let stopRequested = false;

  const scheduleChord = (index: number, at: number) => {
    const chord = LOFI_CHORDS[index % LOFI_CHORDS.length];
    chord.forEach((freq, i) => {
      [-5, 5].forEach((cents) => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        osc.detune.value = cents;

        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, at);
        g.gain.exponentialRampToValueAtTime(0.16, at + 0.8);
        g.gain.setValueAtTime(0.16, at + 2.6);
        g.gain.exponentialRampToValueAtTime(0.0001, at + 3.2);

        osc.connect(g);
        g.connect(padFilter);
        osc.start(at);
        osc.stop(at + 3.4);

        if (i === 0 && cents < 0) {
          createTone(ctx, padFilter, {
            type: 'sine',
            frequency: freq * 2,
            startAt: at,
            duration: 3.1,
            attack: 1,
            release: 0.6,
            volume: 0.08,
          });
        }
      });
    });

    createTone(ctx, bassGain, {
      type: 'sine',
      frequency: chord[0] / 2,
      startAt: at,
      duration: 3.1,
      attack: 0.4,
      release: 0.4,
      volume: 0.5,
    });
  };

  const vinylBuffer = createNoiseBuffer(ctx, 'white');
  const vinylSrc = ctx.createBufferSource();
  vinylSrc.buffer = vinylBuffer;
  vinylSrc.loop = true;
  const vinylFilter = ctx.createBiquadFilter();
  vinylFilter.type = 'highpass';
  vinylFilter.frequency.value = 3500;
  vinylSrc.connect(vinylFilter);
  vinylFilter.connect(crackleGain);
  vinylSrc.start();

  const crackles = scheduleRecurring(90, 480, () => {
    createNoiseBurst(ctx, crackleGain, {
      color: 'white',
      frequency: 4000 + Math.random() * 4000,
      q: 0.6,
      duration: 0.006 + Math.random() * 0.02,
      volume: 0.5 + Math.random() * 0.5,
    });
  });

  const chordTimer = window.setInterval(() => {
    if (stopRequested) return;
    const now = ctx.currentTime;
    while (chordIndex * 3.6 < now + 0.35) {
      scheduleChord(chordIndex, chordIndex * 3.6);
      chordIndex++;
    }
  }, 350);

  return {
    stop: () => {
      stopRequested = true;
      window.clearInterval(chordTimer);
      crackles();
      vinylSrc.stop();
      vinylSrc.disconnect();
      padFilter.disconnect();
      padGain.disconnect();
      bassGain.disconnect();
      crackleGain.disconnect();
    },
  };
}
