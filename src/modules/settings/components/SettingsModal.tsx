import { Check, Minus, Plus, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

import { useStore } from '../../../app/store';
import { CYCLES_LIMITS, DURATION_LIMITS } from '../../../core/constants';
import type { PomodoroConfig, TimerMode } from '../../../core/types/domain';
import { cn } from '../../../shared/utils/cn';
import { useTranslation } from '../../../shared/i18n/useTranslation';
import { LANGUAGES, type Language } from '../../../shared/i18n/types';
import { Button } from '../../../shared/components/ui/Button';
import { Modal } from '../../../shared/components/ui/Modal';
import { Switch } from '../../../shared/components/ui/Switch';
import { selectConfig } from '../../timer/timer.slice';
import { selectLanguage } from '../settings.slice';

/** Campo numérico com setas personalizadas (sem caixa/borda) e valor centralizado. */
function Stepper({
  id,
  value,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const clamp = (next: number) => Math.min(max, Math.max(min, next));
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label={t('settings.stepper.decrease')}
        onClick={() => onChange(clamp(value - step))}
        className="flex size-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/60"
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <div className="relative">
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(clamp(Number(e.target.value) || min))}
          className="ss-number h-9 w-[46px] rounded-xl border border-zinc-200 bg-transparent px-1 text-center text-sm font-semibold tabular-nums outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:text-zinc-100"
        />
      </div>
      <button
        type="button"
        aria-label={t('settings.stepper.increase')}
        onClick={() => onChange(clamp(value + step))}
        className="flex size-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/60"
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

/** Modal de configurações: durações, ciclos, auto-start e notificações. */
export function SettingsModal() {
  const [open, setOpen] = useState(false);
  const config = useStore(selectConfig);
  const applyConfig = useStore((s) => s.applyConfig);
  const notificationsEnabled = useStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useStore((s) => s.setNotificationsEnabled);
  const language = useStore(selectLanguage);
  const setLanguage = useStore((s) => s.setLanguage);
  const { t } = useTranslation();

  const languageOptions: Language[] = LANGUAGES.map((l) => l.id);

  const update = (patch: Partial<PomodoroConfig>) => {
    applyConfig({ ...config, ...patch });
  };

  const toggleNotifications = async (enabled: boolean) => {
    if (enabled && typeof Notification !== 'undefined') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setNotificationsEnabled(false);
        return;
      }
    }
    setNotificationsEnabled(enabled);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Abrir configurações"
        title="Configurações"
        className="text-zinc-600 hover:bg-white/40 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/15 dark:hover:text-zinc-50"
      >
        <SlidersHorizontal className="size-5" />
      </Button>

       <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t('settings.title')}
        aria-label={t('settings.aria')}
      >
        <div className="space-y-6">
          <fieldset className="space-y-3">
            <legend className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              {t('settings.language')}
            </legend>
            <div className="flex flex-wrap gap-2">
              {languageOptions.map((opt) => {
                const active = language === opt;
                const label = LANGUAGES.find((l) => l.id === opt)?.nativeName ?? opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setLanguage(opt)}
                    aria-pressed={active}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                      active
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                        : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800/60',
                    )}
                  >
                    {active && <Check className="size-3.5" aria-hidden="true" />}
                    {label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              {t('settings.durations')}
            </legend>
            {(['FOCUS', 'SHORT_BREAK', 'LONG_BREAK'] as TimerMode[]).map((mode) => {
              const limits = DURATION_LIMITS[mode];
              const key =
                mode === 'FOCUS'
                  ? 'focusDuration'
                  : mode === 'SHORT_BREAK'
                    ? 'shortBreakDuration'
                    : 'longBreakDuration';
              const MODE_KEY: Record<TimerMode, 'settings.mode.focus' | 'settings.mode.shortBreak' | 'settings.mode.longBreak'> = {
                FOCUS: 'settings.mode.focus',
                SHORT_BREAK: 'settings.mode.shortBreak',
                LONG_BREAK: 'settings.mode.longBreak',
              };
              return (
                <div key={mode} className="flex items-center justify-between gap-3">
                  <label htmlFor={`cfg-${mode}`} className="text-sm text-zinc-700 dark:text-zinc-200">
                    {t(MODE_KEY[mode])}
                  </label>
                  <Stepper
                    id={`cfg-${mode}`}
                    value={config[key]}
                    min={limits.min}
                    max={limits.max}
                    step={limits.step}
                    onChange={(v) => update({ [key]: v } as Partial<PomodoroConfig>)}
                  />
                </div>
              );
            })}
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="cfg-cycles" className="text-sm text-zinc-700 dark:text-zinc-200">
                {t('settings.cycles')}
              </label>
              <Stepper
                id="cfg-cycles"
                value={config.cyclesBeforeLongBreak}
                min={CYCLES_LIMITS.min}
                max={CYCLES_LIMITS.max}
                step={CYCLES_LIMITS.step}
                onChange={(v) => update({ cyclesBeforeLongBreak: v })}
              />
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              {t('settings.behavior')}
            </legend>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="cfg-auto-breaks" className="text-sm text-zinc-700 dark:text-zinc-200">
                {t('settings.autoBreaks')}
              </label>
              <Switch
                checked={config.autoStartBreaks}
                onChange={(v) => update({ autoStartBreaks: v })}
                label={t('settings.autoBreaks')}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="cfg-auto-focus" className="text-sm text-zinc-700 dark:text-zinc-200">
                {t('settings.autoFocus')}
              </label>
              <Switch
                checked={config.autoStartPomodoros}
                onChange={(v) => update({ autoStartPomodoros: v })}
                label={t('settings.autoFocus')}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="cfg-notifications" className="text-sm text-zinc-700 dark:text-zinc-200">
                {t('settings.notifications')}
              </label>
              <Switch
                checked={notificationsEnabled}
                onChange={(v) => void toggleNotifications(v)}
                label={t('settings.notifications')}
              />
            </div>
          </fieldset>

          <p className="text-[11px] leading-relaxed text-zinc-400 dark:text-zinc-500">
            {t('settings.tip', { space: t('key.space') })}
          </p>
        </div>
      </Modal>
    </>
  );
}