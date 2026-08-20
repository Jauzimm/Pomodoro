// ============================================================================
// HTML AUDIO FILE STRATEGY — Reprodução de arquivos .mp3 / streams
// Camada: Infrastructure / Adapters
//
// Carrega alertas de `public/sounds/*.mp3` e ambientes de
// `public/sounds/ambient/*.mp3` (ou stream Lo-Fi externo configurável).
// Quando um arquivo não existe, `canPlay*` retorna false e o controller
// cai automaticamente na síntese Web Audio. Se um arquivo existir mas
// falhar ao reproduzir, esta estratégia delega para o `fallback` recebido.
// ============================================================================

import type {
  AmbientSoundType,
  SoundAlertPreset,
} from '../../../core/types/domain';
import type { AudioStrategy } from './audio.strategy';

// Ruído marrom é sintetizado: aponta para um caminho inexistente para que o
// controller caia na síntese Web Audio.
const AMBIENT_FILE_MAP: Record<AmbientSoundType, string> = {
  LOFI_BEATS: '/sounds/ambient/lofi.mp3',
  RAIN: '/sounds/ambient/rain.mp3',
  CAFE: '/sounds/ambient/cafe.mp3',
  FIREPLACE: '/sounds/ambient/fireplace.mp3',
  BROWN_NOISE: '/sounds/ambient/_synth_.mp3',
};

/** Stream contínuo externo opcional para Lo-Fi (vazio = usa arquivo/síntese). */
export const LOFI_STREAM_URL = '';

export class HtmlAudioFileStrategy implements AudioStrategy {
  readonly id = 'html-audio-file';

  private readonly fallback: AudioStrategy | undefined;
  private ambientElement: HTMLAudioElement | null = null;
  private ambientSession = 0;
  private alertElement: HTMLAudioElement | null = null;
  private availabilityCache = new Map<string, boolean>();

  constructor(fallback?: AudioStrategy) {
    this.fallback = fallback;
  }

  async canPlayAlert(sound: SoundAlertPreset): Promise<boolean> {
    return this.fileExists(`/sounds/${sound.toLowerCase()}.mp3`);
  }

  async canPlayAmbient(type: AmbientSoundType): Promise<boolean> {
    if (type === 'LOFI_BEATS' && LOFI_STREAM_URL) return true;
    return this.fileExists(AMBIENT_FILE_MAP[type]);
  }

  playAlert(sound: SoundAlertPreset, volume: number): void {
    this.stopAlert();

    const audio = new Audio(`/sounds/${sound.toLowerCase()}.mp3`);
    audio.volume = volume;

    // Falha ao carregar/reproduzir → delega para a estratégia de síntese.
    const onFail = () => this.fallback?.playAlert(sound, volume);
    audio.addEventListener('error', onFail, { once: true });
    audio.addEventListener(
      'ended',
      () => {
        if (this.alertElement === audio) this.alertElement = null;
      },
      { once: true },
    );
    this.alertElement = audio;
    void audio.play().catch(onFail);
  }

  stopAlert(): void {
    if (this.alertElement) {
      this.alertElement.pause();
      this.alertElement = null;
    }
  }

  startAmbient(type: AmbientSoundType, volume: number): void {
    this.stopAmbient();
    const session = ++this.ambientSession;

    const src =
      type === 'LOFI_BEATS' && LOFI_STREAM_URL
        ? LOFI_STREAM_URL
        : AMBIENT_FILE_MAP[type];

    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = volume;
    this.ambientElement = audio;

    // Só delega para a síntese se este ainda for o ambiente desejado
    // (evita trocas em cascata ao alternar ambientes rapidamente).
    const onFail = () => {
      if (session === this.ambientSession) {
        this.fallback?.startAmbient(type, volume);
      }
    };
    audio.addEventListener('error', onFail, { once: true });
    void audio.play().catch(onFail);
  }

  setAmbientVolume(volume: number): void {
    if (this.ambientElement) this.ambientElement.volume = volume;
  }

  stopAmbient(): void {
    this.ambientSession++;
    this.ambientElement?.pause();
    this.ambientElement = null;
  }

  stopAll(): void {
    this.stopAlert();
    this.stopAmbient();
  }

  /**
   * Verifica (com cache) se o arquivo existe em `public/`.
   * A verificação é assíncrona: o controller aguarda antes de escolher a
   * estratégia, garantindo fallback correto para a síntese quando ausente.
   *
   * ATENÇÃO: servidores SPA (Vite dev, etc.) respondem `200` + `index.html`
   * para qualquer caminho desconhecido. Por isso NÃO basta checar o status:
   * o Content-Type precisa ser um formato de mídia real, nunca `text/html`.
   */
  private async fileExists(path: string): Promise<boolean> {
    const cached = this.availabilityCache.get(path);
    if (cached !== undefined) return cached;

    // Assume inexistente fora do navegador (SSR/tests).
    if (typeof window === 'undefined') return false;

    try {
      const res = await fetch(path, { method: 'HEAD' });
      const contentType = (res.headers.get('content-type') ?? '').toLowerCase();
      const exists = res.ok && !contentType.includes('text/html');
      this.availabilityCache.set(path, exists);
      return exists;
    } catch {
      this.availabilityCache.set(path, false);
      return false;
    }
  }
}