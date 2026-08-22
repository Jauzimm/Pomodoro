// ============================================================================
// SYNTH ALERTS — Síntese procedural de alarmes sonoros
// Camada: Audio Engine (Infrastructure)
// ============================================================================

import type { SoundAlertPreset } from '../../../core/types/domain';
import { createTone } from '../../../shared/utils/soundGenerators';

export interface SynthAlertResult {
  sources: AudioScheduledSourceNode[];
}

/**
 * Síntese do Sino Tibetano: fundamental rica em harmônicos ímpares/pares com longo decaimento.
 */
function playTibetanBowl(
  ctx: AudioContext,
  master: GainNode,
  now: number,
): AudioScheduledSourceNode[] {
  const sources: AudioScheduledSourceNode[] = [];
  const harmonics = [1, 2, 2.97, 4.02];

  harmonics.forEach((ratio, i) => {
    const { oscillator } = createTone(ctx, master, {
      type: 'sine',
      frequency: 220 * ratio,
      startAt: now,
      duration: 4,
      attack: 0.25,
      release: 1.2,
      volume: (1 / harmonics.length) * (i === 0 ? 1.15 : 0.65),
      detune: i === 0 ? 0 : (Math.random() - 0.5) * 6,
    });
    sources.push(oscillator);
  });

  return sources;
}

/**
 * Síntese do Alarme Digital: sequência rítmica de 3 pulsos em onda quadrada.
 */
function playDigitalAlarm(
  ctx: AudioContext,
  master: GainNode,
  now: number,
): AudioScheduledSourceNode[] {
  const sources: AudioScheduledSourceNode[] = [];

  for (let i = 0; i < 3; i++) {
    const { oscillator } = createTone(ctx, master, {
      type: 'square',
      frequency: 880,
      startAt: now + i * 0.22,
      duration: 0.13,
      attack: 0.004,
      release: 0.02,
      volume: 0.5,
    });
    sources.push(oscillator);
  }

  return sources;
}

/**
 * Síntese do Bip Suave: tom senoidal discreto de curta duração.
 */
function playSoftBeep(
  ctx: AudioContext,
  master: GainNode,
  now: number,
): AudioScheduledSourceNode[] {
  const { oscillator } = createTone(ctx, master, {
    type: 'sine',
    frequency: 660,
    startAt: now,
    duration: 0.16,
    attack: 0.006,
    release: 0.05,
    volume: 0.8,
  });

  return [oscillator];
}

/**
 * Orquestrador de sintetização de alertas.
 * Dispara o alarme selecionado e retorna as fontes de áudio rastreáveis.
 */
export function playSynthAlert(
  ctx: AudioContext,
  master: GainNode,
  sound: SoundAlertPreset,
): SynthAlertResult {
  const now = ctx.currentTime + 0.02;
  let sources: AudioScheduledSourceNode[] = [];

  switch (sound) {
    case 'TIBETAN_BOWL':
      sources = playTibetanBowl(ctx, master, now);
      break;
    case 'DIGITAL_ALARM':
      sources = playDigitalAlarm(ctx, master, now);
      break;
    case 'SOFT_BEEP':
      sources = playSoftBeep(ctx, master, now);
      break;
  }

  return { sources };
}
