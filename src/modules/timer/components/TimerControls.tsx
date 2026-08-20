import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react';

import { useStore } from '../../../app/store';
import { Button } from '../../../shared/components/ui/Button';
import { useTranslation } from '../../../shared/i18n/useTranslation';
import { selectIsRunning, selectMode, selectStatus } from '../timer.slice';

/** Controles do timer: Play/Pause, Reset e Skip. */
export function TimerControls() {
  const isRunning = useStore(selectIsRunning);
  const mode = useStore(selectMode);
  const status = useStore(selectStatus);
  const toggle = useStore((s) => s.toggle);
  const reset = useStore((s) => s.reset);
  const skip = useStore((s) => s.skip);
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3" role="group" aria-label={t('timer.controls')}>
      <Button
        variant="ghost"
        size="icon"
        onClick={reset}
        aria-label={t('timer.reset')}
        title={t('timer.resetTitle')}
        className="rounded-full bg-white/40 text-zinc-700 hover:bg-white/60 hover:text-zinc-900 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/20 dark:hover:text-white"
      >
        <RotateCcw className="size-5" />
      </Button>

      <Button
        variant="primary"
        size="lg"
        onClick={toggle}
        aria-label={isRunning ? t('timer.pause') : t('timer.start')}
        title={t('timer.playPauseTitle')}
        className="rounded-full px-8"
      >
        {isRunning ? (
          <Pause className="size-5" fill="currentColor" />
        ) : (
          <Play className="size-5 translate-x-[1px]" fill="currentColor" />
        )}
        {isRunning ? t('timer.pause') : status === 'IDLE' ? t('timer.start') : t('timer.resume')}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={skip}
        aria-label={t('timer.skipAria')}
        title={t('timer.skipTitle')}
        className="rounded-full bg-white/40 text-zinc-700 hover:bg-white/60 hover:text-zinc-900 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/20 dark:hover:text-white"
      >
        <SkipForward className="size-5" />
      </Button>

      <span className="sr-only">{t('timer.currentMode', { mode })}</span>
    </div>
  );
}