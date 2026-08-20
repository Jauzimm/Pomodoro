import { Volume2, VolumeX } from 'lucide-react';

import { useStore } from '../../../app/store';
import { cn } from '../../../shared/utils/cn';
import { useTranslation } from '../../../shared/i18n/useTranslation';
import { selectIsMuted } from '../audio.slice';

interface AudioStatusButtonProps {
  className?: string;
}

/**
 * Botão rápido de mute na barra superior (liga/desliga o som com 1 clique).
 */
export function AudioStatusButton({ className }: AudioStatusButtonProps) {
  const isMuted = useStore(selectIsMuted);
  const toggleMute = useStore((s) => s.toggleMute);
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={toggleMute}
      aria-label={isMuted ? t('audio.unmute') : t('audio.mute')}
      title={isMuted ? t('audio.unmute') : t('audio.mute')}
      className={cn(
        'inline-flex size-10 cursor-pointer items-center justify-center rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
        isMuted
          ? 'text-rose-500 hover:bg-rose-500/10'
          : 'text-zinc-500 hover:bg-zinc-200/70 dark:text-zinc-300 dark:hover:bg-zinc-800',
        className,
      )}
    >
      {isMuted ? (
        <VolumeX className="size-5" aria-hidden="true" />
      ) : (
        <Volume2 className="size-5" aria-hidden="true" />
      )}
    </button>
  );
}