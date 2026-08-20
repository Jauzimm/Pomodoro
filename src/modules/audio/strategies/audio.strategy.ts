// ============================================================================
// AUDIO STRATEGY — Contrato comum do subsistema de som (Strategy Pattern)
// Camada: Infrastructure / Adapters
//
// A UI nunca sabe como o som é produzido: ela conversa apenas com esta
// interface. Estratégias diferentes (síntese Web Audio ou arquivos .mp3)
// podem ser trocadas sem tocar em nenhum componente.
// ============================================================================

import type { AmbientSoundType, SoundAlertPreset } from '../../../core/types/domain';

export interface AudioStrategy {
  readonly id: string;
  /** Indica se esta estratégia consegue reproduzir o alerta solicitado (verificação pode ser assíncrona). */
  canPlayAlert(sound: SoundAlertPreset): Promise<boolean>;
  /** Indica se esta estratégia consegue reproduzir o ambiente solicitado. */
  canPlayAmbient(type: AmbientSoundType): Promise<boolean>;
  /** Toca o alerta de conclusão de ciclo (fire-and-forget). */
  playAlert(sound: SoundAlertPreset, volume: number): void;
  /** Interrompe imediatamente qualquer alerta em reprodução (apenas um por vez). */
  stopAlert(): void;
  /** Inicia (ou troca) o som ambiente contínuo. */
  startAmbient(type: AmbientSoundType, volume: number): void;
  /** Ajusta o volume do ambiente ativo em tempo real. */
  setAmbientVolume(volume: number): void;
  /** Para o ambiente atual (mantendo o contexto de áudio vivo). */
  stopAmbient(): void;
  /** Para tudo (alarmes + ambientes). */
  stopAll(): void;
}