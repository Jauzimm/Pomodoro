// ============================================================================
// AUDIO CONTROLLER — Orquestrador de estratégias de som (Strategy Pattern + DI)
// Camada: Application Logic (serviço de áudio)
//
// Encapsula a seleção dinâmica de estratégia (html file -> web audio synth fallback),
// o desbloqueio de contexto (autoplay policy) e a sincronização do som ambiente.
// Permite injeção de dependências para isolamento em testes.
// ============================================================================

import type {
  AmbientSoundType,
  SoundAlertPreset,
} from '../../../core/types/domain';
import {
  unlockAudioContext,
  WebAudioSynthStrategy,
} from '../strategies/webAudioSynth.strategy';
import { HtmlAudioFileStrategy } from '../strategies/htmlAudioFile.strategy';
import type { AudioStrategy } from '../strategies/audio.strategy';

type StrategyKind = 'alert' | 'ambient';

export interface IAudioController {
  unlock(): Promise<void>;
  playAlert(sound: SoundAlertPreset, volume: number): Promise<void>;
  setAlertVolume(volume: number): void;
  stopAlert(): void;
  setAmbient(type: AmbientSoundType | null, volume: number): Promise<void>;
  setAmbientVolume(volume: number): void;
  stopAll(): void;
}

export class AudioController implements IAudioController {
  private readonly strategies: AudioStrategy[];
  private ambient: { type: AmbientSoundType; strategy: AudioStrategy } | null = null;
  private currentAmbientRequestId = 0;

  constructor(strategies?: AudioStrategy[]) {
    if (strategies && strategies.length > 0) {
      this.strategies = strategies;
    } else {
      // Default: HtmlAudioFileStrategy com síntese Web Audio como fallback
      const synth = new WebAudioSynthStrategy();
      this.strategies = [new HtmlAudioFileStrategy(synth), synth];
    }
  }

  /** Deve ser chamado após o primeiro gesto do usuário (autoplay policy). */
  unlock(): Promise<void> {
    return unlockAudioContext();
  }

  /** Resolve a primeira estratégia capaz de reproduzir o recurso solicitado. */
  private async resolveStrategy(
    kind: StrategyKind,
    sound: SoundAlertPreset | AmbientSoundType,
  ): Promise<AudioStrategy> {
    for (const strategy of this.strategies) {
      const canPlay =
        kind === 'alert'
          ? strategy.canPlayAlert(sound as SoundAlertPreset)
          : strategy.canPlayAmbient(sound as AmbientSoundType);

      if (await canPlay) return strategy;
    }
    // Fallback garantido: última estratégia registrada (síntese)
    return this.strategies[this.strategies.length - 1];
  }

  /** Toca o alarme de conclusão de ciclo na primeira estratégia capaz. */
  async playAlert(sound: SoundAlertPreset, volume: number): Promise<void> {
    if (volume <= 0) {
      this.stopAlert();
      return;
    }

    this.stopAlert();
    const strategy = await this.resolveStrategy('alert', sound);
    strategy.playAlert(sound, volume);
  }

  /** Ajusta o volume do alerta ativo em tempo real. */
  setAlertVolume(volume: number): void {
    for (const strategy of this.strategies) {
      strategy.setAlertVolume(volume);
    }
  }

  /** Interrompe imediatamente qualquer alarme em reprodução. */
  stopAlert(): void {
    for (const strategy of this.strategies) {
      strategy.stopAlert();
    }
  }

  /**
   * Ativa, altera ou desliga o som ambiente.
   * `type = null` desliga o som ambiente ativo.
   */
  async setAmbient(type: AmbientSoundType | null, volume: number): Promise<void> {
    const requestId = ++this.currentAmbientRequestId;

    if (type === null) {
      this.ambient?.strategy.stopAmbient();
      this.ambient = null;
      return;
    }

    if (this.ambient?.type === type) {
      this.setAmbientVolume(volume);
      return;
    }

    this.ambient?.strategy.stopAmbient();
    this.ambient = null;

    const strategy = await this.resolveStrategy('ambient', type);

    // Evita condição de corrida se o usuário trocou o tipo durante a resolução assíncrona
    if (this.currentAmbientRequestId !== requestId) {
      return;
    }

    strategy.startAmbient(type, volume);
    this.ambient = { type, strategy };
  }

  /** Ajusta o volume do ambiente ativo em tempo real. */
  setAmbientVolume(volume: number): void {
    this.ambient?.strategy.setAmbientVolume(volume);
  }

  /** Para todos os canais de áudio (alarmes + som ambiente). */
  stopAll(): void {
    this.stopAlert();
    this.ambient?.strategy.stopAll();
    this.ambient = null;
  }
}

/** Singleton padrão da aplicação. */
export const audioController = new AudioController();
