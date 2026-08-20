import { useEffect } from 'react';

import { useStore } from '../../../app/store';
import { domainEventBus } from '../../../core/domain/eventBus';
import { useTranslation } from '../../../shared/i18n/useTranslation';
import { modeKey } from '../../../shared/i18n/labels';
import { selectNotificationsEnabled } from '../settings.slice';

/**
 * Observer Timer → Notification API: ao concluir um ciclo, notifica o
 * navegador (quando a permissão foi concedida pelo usuário).
 */
export function useNotifications(): void {
  const { t } = useTranslation();
  const isEnabled = useStore(selectNotificationsEnabled);

  useEffect(() => {
    if (!isEnabled) return;
    const unsubscribe = domainEventBus.subscribe('timer:completed', (event) => {
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
        return;
      }
      const nextMode = t(
        modeKey(event.completedMode === 'FOCUS' ? 'SHORT_BREAK' : 'FOCUS'),
      );
      new Notification(t('notif.title'), {
        body:
          event.completedMode === 'FOCUS'
            ? t('notif.focusDone', { next: nextMode })
            : t('notif.breakDone', { next: nextMode }),
        tag: 'studyspace-cycle',
      });
    });
    return unsubscribe;
  }, [isEnabled, t]);
}