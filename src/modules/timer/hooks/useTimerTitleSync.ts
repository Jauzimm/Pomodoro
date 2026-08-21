import { useEffect } from 'react';

import { formatTime } from '../../../shared/utils/formatTime';
import { useStore } from '../../../app/store';
import { useTranslation } from '../../../shared/i18n/useTranslation';
import { phaseKey } from '../../../shared/i18n/labels';
import {
  selectMode,
  selectPhase,
  selectTimeLeft,
} from '../timer.slice';

/**
 * Mantém o título da aba do navegador atualizado em tempo real:
 * `25:00 - Foco | PomoraNeo` ou o estado atual (pausado/parado).
 */
export function useTimerTitleSync(): void {
  const timeLeft = useStore(selectTimeLeft);
  const mode = useStore(selectMode);
  const phase = useStore(selectPhase);
  const { t } = useTranslation();

  useEffect(() => {
    const label = t(phaseKey(phase));
    document.title = `${formatTime(timeLeft)} · ${label} | PomoraNeo`;
    return () => {
      document.title = t('title.idle');
    };
  }, [timeLeft, mode, phase, t]);
}