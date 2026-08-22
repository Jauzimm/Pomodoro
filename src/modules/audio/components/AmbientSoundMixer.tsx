import {
  CloudRain,
  Coffee,
  Disc3,
  Flame,
  Headphones,
  Volume2,
  VolumeX,
  Wind,
} from 'lucide-react';

import { useStore } from '../../../app/store';
import { AMBIENT_SOUNDS } from '../../../core/constants';
import type { AmbientSoundType } from '../../../core/types/domain';
import { cn } from '../../../shared/utils/cn';
import { useTranslation } from '../../../shared/i18n/useTranslation';
import { Slider } from '../../../shared/components/ui/Slider';
import { selectAmbientType, selectAudio } from '../audio.slice';

const AMBIENT_ICONS: Record<AmbientSoundType, typeof Disc3> = {
  LOFI_BEATS: Disc3,
  RAIN: CloudRain,
  CAFE: Coffee,
  FIREPLACE: Flame,
  BROWN_NOISE: Wind,
};

const AMBIENT_KEYS: Record<AmbientSoundType, 'ambient.lofi' | 'ambient.rain' | 'ambient.cafe' | 'ambient.fireplace' | 'ambient.brown'> = {
  LOFI_BEATS: 'ambient.lofi',
  RAIN: 'ambient.rain',
  CAFE: 'ambient.cafe',
  FIREPLACE: 'ambient.fireplace',
  BROWN_NOISE: 'ambient.brown',
};

/**
 * Mixer de áudio ambiente: seleção em 1 clique + volume independente.
 * Canal secundário, totalmente desacoplado dos alarmes.
 */
export function AmbientSoundMixer() {
  const ambientType = useStore(selectAmbientType);
  const audio = useStore(selectAudio);
  const setAmbientType = useStore((s) => s.setAmbientType);
  const setAmbientVolume = useStore((s) => s.setAmbientVolume);
  const toggleMute = useStore((s) => s.toggleMute);
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {AMBIENT_SOUNDS.map(({ id }) => {
          const Icon = AMBIENT_ICONS[id];
          const active = ambientType === id;
          const label = t(AMBIENT_KEYS[id]);
          return (
            <button
              key={id}
              type="button"
              onClick={() => setAmbientType(active ? null : id)}
              aria-pressed={active}
              aria-label={t('audio.ambient.activate', { label })}
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
        <Headphones className="size-4 shrink-0 text-zinc-400" aria-hidden="true" />
        <Slider
          value={audio.ambientVolume * 100}
          onChange={(v) => setAmbientVolume(v / 100)}
          min={0}
          max={100}
          label={t('audio.ambientVolume')}
          disabled={ambientType === null}
        />
        <span className="w-8 text-right text-xs font-medium text-zinc-400 tabular-nums dark:text-zinc-500">
          {Math.round(audio.ambientVolume * 100)}
        </span>
        <button
          type="button"
          onClick={toggleMute}
          disabled={ambientType === null}
          aria-label={audio.isMuted ? t('audio.unmute') : t('audio.mute')}
          title={audio.isMuted ? t('audio.unmute') : t('audio.mute')}
          className="flex size-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          {audio.isMuted ? (
            <VolumeX className="size-4 shrink-0" aria-hidden="true" />
          ) : (
            <Volume2 className="size-4 shrink-0" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}