import { AlarmClock, Bell, Volume2, VolumeX } from 'lucide-react';

import { useStore } from '../../../app/store';
import { SOUND_PRESETS } from '../../../core/constants';
import type { SoundAlertPreset } from '../../../core/types/domain';
import { cn } from '../../../shared/utils/cn';
import { useTranslation } from '../../../shared/i18n/useTranslation';
import { Slider } from '../../../shared/components/ui/Slider';
import { selectAudio } from '../audio.slice';
import { audioController } from '../services/audioController';

const ALERT_ICONS = {
  TIBETAN_BOWL: Bell,
  DIGITAL_ALARM: AlarmClock,
  SOFT_BEEP: Volume2,
} as const;

const SOUND_KEYS: Record<SoundAlertPreset, 'sound.tibetan' | 'sound.digital' | 'sound.soft'> = {
  TIBETAN_BOWL: 'sound.tibetan',
  DIGITAL_ALARM: 'sound.digital',
  SOFT_BEEP: 'sound.soft',
};

/**
 * Seletor do alarme de conclusão de ciclo com pré-escuta (teste) e
 * volume dedicado. Canal primário, independente do mixer ambiente.
 */
export function AlertSoundSelector() {
  const audio = useStore(selectAudio);
  const setAlertSound = useStore((s) => s.setAlertSound);
  const setAlertVolume = useStore((s) => s.setAlertVolume);
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {SOUND_PRESETS.map(({ id }) => {
          const Icon = ALERT_ICONS[id];
          const active = audio.alertSound === id;
          const label = t(SOUND_KEYS[id]);
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                audioController.stopAlert();
                setAlertSound(id);
              }}
              aria-pressed={active}
              className={cn(
                'group flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border p-2 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                active
                  ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                  : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/60',
              )}
            >
              <Icon
                className={cn(
                  'size-6',
                  active
                    ? 'text-indigo-500'
                    : 'text-zinc-400 group-hover:text-zinc-500 dark:text-zinc-500 dark:group-hover:text-zinc-300',
                )}
                aria-hidden="true"
              />
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">
                {label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => audioController.playAlert(audio.alertSound, audio.alertVolume)}
            aria-label={t('audio.alert.testAria', { label: t(SOUND_KEYS[audio.alertSound]) })}
            title={t('audio.alert.preview')}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {t('audio.alert.test')}
          </button>

          <div className="flex flex-1 items-center gap-3">
            <Slider
              value={audio.alertVolume * 100}
              onChange={(v) => setAlertVolume(v / 100)}
              min={0}
              max={100}
              label={t('audio.alertVolume')}
            />
          <span className="w-8 text-right text-xs font-medium text-zinc-400 tabular-nums dark:text-zinc-500">
            {Math.round(audio.alertVolume * 100)}
          </span>
          {audio.alertVolume === 0 ? (
            <VolumeX className="size-4 shrink-0 text-zinc-400" aria-hidden="true" />
          ) : (
            <Volume2 className="size-4 shrink-0 text-zinc-400" aria-hidden="true" />
          )}
        </div>
      </div>
    </div>
  );
}