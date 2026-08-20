// ============================================================================
// AUDIO CONTROLLER — Orquestrador das estratégias de som (singleton)
// Camada: Application Logic (serviço de áudio)
//
// Encapsula a seleção de estratégia (html → synth fallback), o desbloqueio do
// AudioContext e o estado do ambiente ativo. A UI só conversa com este serviço.
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

class AudioController {
  private readonly strategies: AudioStrategy[];

  private ambient: { type: AmbientSoundType; strategy: AudioStrategy } | null = null;

  constructor() {
    // A síntese Web Audio é o fallback garantido: além de ser resolvida
    // quando nenhuma estratégia consegue reproduzir, é injetada na estratégia
    // HTML para cobrir falhas de reprodução em tempo de execução.
    const synth = new WebAudioSynthStrategy();
    this.strategies = [new HtmlAudioFileStrategy(synth), synth];
  }

  /** Deve ser chamado após o primeiro gesto do usuário (autoplay policy). */
  unlock(): Promise<void> {
    return unlockAudioContext();
  }

  /** Resolve a primeira estratégia capaz de reproduzir o recurso pedido. */
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
    // Fallback garantido: a síntese Web Audio responde por tudo.
    return this.strategies[this.strategies.length - 1];
  }

  /** Toca o alarme de conclusão de ciclo na primeira estratégia capaz. */
  async playAlert(sound: SoundAlertPreset, volume: number): Promise<void> {
    // Garante um único alarme por vez: corta qualquer alerta em reprodução.
    this.stopAlert();
    const strategy = await this.resolveStrategy('alert', sound);
    strategy.playAlert(sound, volume);
  }

  /** Interrompe imediatamente o alarme em reprodução (em todas as estratégias). */
  stopAlert(): void {
    for (const strategy of this.strategies) strategy.stopAlert();
  }

  /**
   * Liga/troca/desliga o som ambiente.
   * `type = null` desliga; caso contrário escolhe a melhor estratégia.
   */
  async setAmbient(type: AmbientSoundType | null, volume: number): Promise<void> {
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

    const strategy = await this.resolveStrategy('ambient', type);
    strategy.startAmbient(type, volume);
    this.ambient = { type, strategy };
  }

  /** Ajusta o volume do ambiente ativo em tempo real. */
  setAmbientVolume(volume: number): void {
    this.ambient?.strategy.setAmbientVolume(volume);
  }

  /** Para todos os sons (alarmes + ambiente). */
  stopAll(): void {
    this.stopAlert();
    this.ambient?.strategy.stopAll();
    this.ambient = null;
  }
}

/** Singleton global do controlador de áudio. */
export const audioController = new AudioController();