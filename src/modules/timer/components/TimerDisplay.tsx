import { useStore } from '../../../app/store';
import { formatTime } from '../../../shared/utils/formatTime';
import { selectTimeLeft } from '../timer.slice';

/**
 * Display principal do tempo restante.
 * Seleciona apenas `timeLeft` no store: segundos não re-renderizam o resto da UI.
 */
export function TimerDisplay() {
  const timeLeft = useStore(selectTimeLeft);

  return (
    <time
      dateTime={`PT${Math.floor(timeLeft)}S`}
      aria-live="off"
      className="font-mono text-[72px] font-bold leading-none tracking-tight tabular-nums text-zinc-900 sm:text-[84px] dark:text-zinc-50"
    >
      {formatTime(timeLeft)}
    </time>
  );
}