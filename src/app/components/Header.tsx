import { BrainCircuit } from 'lucide-react';

import { AudioStatusButton } from '../../modules/audio/components/AudioStatusButton';
import { SettingsModal } from '../../modules/settings/components/SettingsModal';
import { useTranslation } from '../../shared/i18n/useTranslation';

/** Cabeçalho flutuante (ilha de vidro): logo à esquerda, ações à direita. */
export function Header() {
  const { t } = useTranslation();
  return (
    <header className="fixed left-1/2 top-3 z-40 w-[calc(100%-1.5rem)] max-w-6xl -translate-x-1/2">
      <div className="flex h-14 items-center justify-between rounded-2xl border border-zinc-200/50 bg-white/40 px-3 shadow-lg shadow-black/5 backdrop-blur-md dark:border-white/15 dark:bg-white/5 dark:shadow-black/30">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-600/40">
            <BrainCircuit className="size-5" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Study<span className="text-indigo-500">Space</span>
            </p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              {t('header.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <AudioStatusButton className="text-zinc-600 hover:bg-white/40 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/15 dark:hover:text-zinc-50" />
          <SettingsModal />
        </div>
      </div>
    </header>
  );
}