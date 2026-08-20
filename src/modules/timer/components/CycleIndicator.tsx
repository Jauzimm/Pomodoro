import { useStore } from '../../../app/store';
import { cn } from '../../../shared/utils/cn';
import { useTranslation } from '../../../shared/i18n/useTranslation';
import {
  selectCycle,
  selectCycleCount,
  selectMode,
} from '../timer.slice';

/**
 * Indicador visual do progresso de ciclos: "Sessão 2/4" + pontos
 * preenchidos conforme o ciclo atual (antes do descanso longo).
 */
export function CycleIndicator() {
  const currentCycle = useStore(selectCycle);
  const cycleCount = useStore(selectCycleCount);
  const mode = useStore(selectMode);
  const { t } = useTranslation();

  const filled =
    mode === 'FOCUS' ? currentCycle - 1 : Math.min(currentCycle, cycleCount);

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-medium uppercase tracking-widest text-zinc-50">
        {t('cycle.session', { current: Math.min(currentCycle, cycleCount), total: cycleCount })}
      </p>
      <div className="flex items-center gap-1.5" role="img" aria-label={t('cycle.aria', { filled, total: cycleCount })}>
        {Array.from({ length: cycleCount }, (_, i) => (
          <span
            key={i}
            className={cn(
              'size-2 rounded-full transition-colors duration-300',
              i < filled
                ? 'bg-indigo-500'
                : i === filled && mode === 'FOCUS'
                  ? 'bg-indigo-300 dark:bg-indigo-600'
                  : 'bg-zinc-200 dark:bg-zinc-700',
            )}
          />
        ))}
      </div>
    </div>
  );
}