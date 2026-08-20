import { useEffect } from 'react';

import { useStore } from '../../../app/store';
import { domainEventBus } from '../../../core/domain/eventBus';
import {
  selectAudio,
  selectIsMuted,
  selectAmbientType,
} from '../audio.slice';
import { audioController } from '../services/audioController';

/**
 * Hook raiz do subsistema de áudio. Responsabilidades:
 *  1. Desbloquear o AudioContext no primeiro gesto do usuário;
 *  2. Sincronizar o ambiente ativo com o slice (tipo + volume + mute);
 *  3. Reagir ao evento `timer:completed` tocando o alarme configurado.
 *
 * A UI não chama estratégias diretamente: tudo passa pelo controller.
 */
export function useAudioController(): void {
  const audio = useStore(selectAudio);
  const ambientType = useStore(selectAmbientType);
  const isMuted = useStore(selectIsMuted);

  // 1) Unlock do AudioContext após o primeiro clique/tecla.
  useEffect(() => {
    const unlock = () => {
      void audioController.unlock();
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  // 2) Sincronização do ambiente (tipo/volume/mute) com o controller.
  useEffect(() => {
    void audioController.setAmbient(ambientType, isMuted ? 0 : audio.ambientVolume);
  }, [ambientType, audio.ambientVolume, isMuted]);

  // 3) Alarme de conclusão de ciclo via Observer (domain event bus).
  useEffect(() => {
    const unsubscribe = domainEventBus.subscribe('timer:completed', () => {
      if (isMuted) return;
      void audioController.playAlert(audio.alertSound, audio.alertVolume);
    });
    return unsubscribe;
  }, [audio.alertSound, audio.alertVolume, isMuted]);
}