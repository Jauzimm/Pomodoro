import { useStore } from '../../../app/store';
import { cn } from '../../../shared/utils/cn';
import { useTranslation } from '../../../shared/i18n/useTranslation';
import { modeKey } from '../../../shared/i18n/labels';
import {
  selectCurrentDuration,
  selectMode,
  selectTimeLeft,
} from '../timer.slice';
import { ActiveTaskBar } from './ActiveTaskBar';
import { CircularProgress } from './CircularProgress';
import { CycleIndicator } from './CycleIndicator';
import { TimerControls } from './TimerControls';
import { TimerDisplay } from './TimerDisplay';

const modeAccent: Record<string, string> = {
  FOCUS: 'stroke-indigo-500',
  SHORT_BREAK: 'stroke-emerald-500',
  LONG_BREAK: 'stroke-sky-500',
};

const modeText: Record<string, string> = {
  FOCUS: 'text-indigo-500 dark:text-indigo-400',
  SHORT_BREAK: 'text-emerald-500 dark:text-emerald-400',
  LONG_BREAK: 'text-sky-500 dark:text-sky-400',
};

interface PomodoroCardProps {
  /** Modo Zen: oculta controles e tarefa ativa, deixando só o timer. */
  zenHidden?: boolean;
}

/** Card central do Pomodoro: progresso circular + display + controles. */
export function PomodoroCard({ zenHidden = false }: PomodoroCardProps) {
  const timeLeft = useStore(selectTimeLeft);
  const total = useStore(selectCurrentDuration);
  const mode = useStore(selectMode);
  const { t } = useTranslation();
  const progress = total > 0 ? 1 - timeLeft / total : 0;

  return (
    <section
      aria-label={t('timer.label')}
      className="flex flex-col items-center gap-8"
    >
      <CircularProgress
        progress={progress}
        strokeClass={modeAccent[mode]}
        className="max-w-full"
      >
        <TimerDisplay />
        <span className={cn('text-sm font-medium uppercase tracking-widest', modeText[mode])}>
          {t(modeKey(mode))}
        </span>
        <div className="mt-2">
          <CycleIndicator />
        </div>
      </CircularProgress>

      <div
        className={cn(
          'flex flex-col items-center gap-8 transition-all duration-500 ease-in-out',
          zenHidden && 'pointer-events-none select-none opacity-0',
        )}
      >
        <TimerControls />
        <ActiveTaskBar />
      </div>
    </section>
  );
}