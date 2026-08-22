// ============================================================================
// WEB AUDIO SYNTH STRATEGY — Adaptador de Síntese 100% Procedural
// Camada: Infrastructure / Strategy Pattern
//
// Delega a geração de áudio aos motores modulares em `src/modules/audio/engine/`.
// Implementa o contrato AudioStrategy com zero assets de rede.
// ============================================================================

import type {
  AmbientSoundType,
  SoundAlertPreset,
} from '../../../core/types/domain';
import {
  type AmbientHandle,
  buildBrownNoise,
  buildCafe,
  buildFireplace,
  buildLofi,
  buildRain,
} from '../engine/ambientGenerators';
import {
  getAudioContext,
  unlockAudioContext,
} from '../engine/audioContextManager';
import { playSynthAlert } from '../engine/synthAlerts';
import type { AudioStrategy } from './audio.strategy';

export { getAudioContext, unlockAudioContext };

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

    const clampedVolume = Math.min(1, Math.max(0, volume));
    if (clampedVolume <= 0) return;

    const ctx = getAudioContext();
    if (ctx.state === 'suspended') void ctx.resume();

    const master = this.createMaster();
    master.gain.value = clampedVolume;
    this.alertMaster = master;

    const { sources } = playSynthAlert(ctx, master, sound);
    this.alertSources.push(...sources);
  }

  setAlertVolume(volume: number): void {
    if (this.alertMaster) {
      const clampedVolume = Math.min(1, Math.max(0, volume));
      this.alertMaster.gain.setTargetAtTime(
        clampedVolume,
        getAudioContext().currentTime,
        0.05,
      );
    }
  }

  stopAlert(): void {
    for (const node of this.alertSources) {
      try {
        node.stop();
      } catch {
        // Já finalizado
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

    // Compressor dinâmico suave para prevenir clipping
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 24;
    compressor.ratio.value = 6;
    master.connect(compressor);
    compressor.connect(ctx.destination);

    this.ambientGain = master;

    switch (type) {
      case 'BROWN_NOISE':
        this.ambientHandle = buildBrownNoise(ctx, master);
        break;
      case 'RAIN':
        this.ambientHandle = buildRain(ctx, master);
        break;
      case 'CAFE':
        this.ambientHandle = buildCafe(ctx, master);
        break;
      case 'FIREPLACE':
        this.ambientHandle = buildFireplace(ctx, master);
        break;
      case 'LOFI_BEATS':
        this.ambientHandle = buildLofi(ctx, master);
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

  /** Cria o nó de ganho master de alarme conectado ao destino de áudio. */
  private createMaster(): GainNode {
    const ctx = getAudioContext();
    const master = ctx.createGain();
    master.connect(ctx.destination);
    return master;
  }
}
