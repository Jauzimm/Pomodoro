// ============================================================================
// WEB AUDIO SYNTH STRATEGY — Síntese 100% procedural (zero assets)
// Camada: Infrastructure / Adapters
//
// Gera alarmes (sino/bip) e ambientes (chuva, café, lareira, ruídos,
// Lo-Fi) diretamente via AudioContext nativo. Não depende de nenhum arquivo.
// ============================================================================

import type {
  AmbientSoundType,
  SoundAlertPreset,
} from '../../../core/types/domain';
import {
  createNoiseBuffer,
  createNoiseBurst,
  createTone,
} from '../../../shared/utils/soundGenerators';
import type { AudioStrategy } from './audio.strategy';

/** Singleton lazy do AudioContext (respeita autoplay dos navegadores). */
let sharedContext: AudioContext | null = null;

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

/** Desbloqueia o contexto após um gesto do usuário (política de autoplay). */
export function unlockAudioContext(): Promise<void> {
  const ctx = getAudioContext();
  return ctx.state === 'suspended' ? ctx.resume() : Promise.resolve();
}

// ---------------------------------------------------------------------------
// Mapa de frequências para a progressão Lo-Fi (Am7 → Fmaj7 → Cmaj7 → G)
// ---------------------------------------------------------------------------
const LOFI_CHORDS: number[][] = [
  [110, 130.81, 164.81, 196.0], // Am7
  [87.31, 110.0, 130.81, 164.81], // Fmaj7
  [130.81, 164.81, 196.0, 246.94], // Cmaj7
  [98.0, 123.47, 146.83], // G
];

interface AmbientHandle {
  stop(): void;
}

/** Agenda eventos aleatórios recorrentes enquanto o ambiente estiver ativo. */
function scheduleRecurring(
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

export class WebAudioSynthStrategy implements AudioStrategy {
  readonly id = 'webaudio-synth';

  private ambientGain: GainNode | null = null;
  private ambientHandle: AmbientHandle | null = null;
  private alertMaster: GainNode | null = null;
  private alertSources: AudioScheduledSourceNode[] = [];

  async canPlayAlert(): Promise<boolean> {
    return true;
  }

  async canPlayAmbient(): Promise<boolean> {
    return true;
  }

  // -------------------------------------------------------------------------
  // ALARMES
  // -------------------------------------------------------------------------

  playAlert(sound: SoundAlertPreset, volume: number): void {
    this.stopAlert();

    const ctx = getAudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    const master = this.createMaster();
    this.alertMaster = master;
    const now = ctx.currentTime + 0.02;

    // Agenda um tom e o mantém rastreável para corte imediato.
    const tone = (
      opts: Parameters<typeof createTone>[2],
    ) => {
      const { oscillator } = createTone(ctx, master, {
        ...opts,
        startAt: opts.startAt ?? now,
      });
      this.alertSources.push(oscillator);
    };

    switch (sound) {
      case 'TIBETAN_BOWL': {
        // Fundamental + harmônicos com decay longo (≈ 4s).
        const harmonics = [1, 2, 2.97, 4.02];
        harmonics.forEach((ratio, i) => {
          tone({
            type: 'sine',
            frequency: 220 * ratio,
            duration: 4,
            attack: 0.25,
            release: 1.2,
            volume: (volume / harmonics.length) * (i === 0 ? 1.15 : 0.65),
            detune: i === 0 ? 0 : (Math.random() - 0.5) * 6,
          });
        });
        break;
      }

      case 'DIGITAL_ALARM': {
        // Três bipes quadrados clássicos.
        for (let i = 0; i < 3; i++) {
          tone({
            type: 'square',
            frequency: 880,
            startAt: now + i * 0.22,
            duration: 0.13,
            attack: 0.004,
            release: 0.02,
            volume: volume * 0.5,
          });
        }
        break;
      }

      case 'SOFT_BEEP': {
        tone({
          type: 'sine',
          frequency: 660,
          duration: 0.16,
          attack: 0.006,
          release: 0.05,
          volume: volume * 0.8,
        });
        break;
      }
    }
  }

  stopAlert(): void {
    for (const node of this.alertSources) {
      try {
        node.stop();
      } catch {
        // já finalizado
      }
      node.disconnect();
    }
    this.alertSources = [];
    if (this.alertMaster) {
      this.alertMaster.disconnect();
      this.alertMaster = null;
    }
  }

  // -------------------------------------------------------------------------
  // AMBIENTES
  // -------------------------------------------------------------------------

  startAmbient(type: AmbientSoundType, volume: number): void {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') void ctx.resume();

    this.stopAmbient();

    const master = ctx.createGain();
    master.gain.value = volume;

    // Compressor suave evita clipping quando várias camadas somam.
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 24;
    compressor.ratio.value = 6;
    master.connect(compressor);
    compressor.connect(ctx.destination);

    this.ambientGain = master;

    switch (type) {
      case 'BROWN_NOISE':
        this.ambientHandle = this.buildBrownNoise(ctx, master);
        break;
      case 'RAIN':
        this.ambientHandle = this.buildRain(ctx, master);
        break;
      case 'CAFE':
        this.ambientHandle = this.buildCafe(ctx, master);
        break;
      case 'FIREPLACE':
        this.ambientHandle = this.buildFireplace(ctx, master);
        break;
      case 'LOFI_BEATS':
        this.ambientHandle = this.buildLofi(ctx, master);
        break;
    }
  }

  setAmbientVolume(volume: number): void {
    if (this.ambientGain) {
      this.ambientGain.gain.setTargetAtTime(volume, getAudioContext().currentTime, 0.05);
    }
  }

  stopAmbient(): void {
    this.ambientHandle?.stop();
    this.ambientHandle = null;
    if (this.ambientGain) {
      const gain = this.ambientGain;
      const ctx = getAudioContext();
      gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.03);
      window.setTimeout(() => gain.disconnect(), 300);
      this.ambientGain = null;
    }
  }

  stopAll(): void {
    this.stopAlert();
    this.stopAmbient();
  }

  // -------------------------------------------------------------------------
  // CONSTRUTORES DE AMBIENTE (retornam handle de parada)
  // -------------------------------------------------------------------------

  private buildBrownNoise(ctx: AudioContext, dest: AudioNode): AmbientHandle {
    const buffer = createNoiseBuffer(ctx, 'brown');
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    // Tame o ronco grave extremo para não virar um subwoofer.
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

  private buildRain(ctx: AudioContext, dest: AudioNode): AmbientHandle {
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

    // Gotas discretas aleatórias sobre o manto contínuo.
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

  private buildCafe(ctx: AudioContext, dest: AudioNode): AmbientHandle {
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

    // Burburinho humano: bursts curtos de ruído filtrado em bandas médias.
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

  private buildFireplace(ctx: AudioContext, dest: AudioNode): AmbientHandle {
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

    // Estalos da lenha: pops curtos e agudos em intervalos irregulares.
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

  private buildLofi(ctx: AudioContext, dest: AudioNode): AmbientHandle {
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
        // Dois osciladores levemente desafinados (efeito "wobble" lo-fi).
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

          // Harmônico suave (sinusoidal) para dar corpo.
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

      // Baixo na tônica, uma oitava abaixo.
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

    // Manto de crackle de vinil contínuo.
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

    // Scheduler lookahead (350ms) garantindo transições suaves entre acordes.
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

  /** Cria o nó de master de alarme (volume do alerta × volume mestre). */
  private createMaster(): GainNode {
    const ctx = getAudioContext();
    const master = ctx.createGain();
    master.connect(ctx.destination);
    return master;
  }
}