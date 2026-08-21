import { AudioStatusButton } from '../../modules/audio/components/AudioStatusButton';
import { SettingsModal } from '../../modules/settings/components/SettingsModal';
import { cn } from '../../shared/utils/cn';

interface HeaderProps {
  /** Modo Zen: oculta o cabeçalho (transição suave + sem interação). */
  zenHidden?: boolean;
}

/** Cabeçalho flutuante (ilha de vidro): logo à esquerda, ações à direita. */
export function Header({ zenHidden = false }: HeaderProps) {
  return (
    <header
      className={cn(
        'fixed left-1/2 top-3 z-40 w-[calc(100%-1.5rem)] max-w-6xl -translate-x-1/2 transition-all duration-500 ease-in-out',
        zenHidden && 'pointer-events-none -translate-y-24 opacity-0',
      )}
    >
      <div className="flex h-14 items-center justify-between rounded-2xl border border-zinc-200/50 bg-white/40 px-3 shadow-lg shadow-black/5 backdrop-blur-md dark:border-white/15 dark:bg-white/5 dark:shadow-black/30">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt=""
            aria-hidden="true"
            className="size-9 rounded-xl object-cover"
          />
          <div className="leading-tight">
            <p className="text-[22px] font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              <span className="text-white">Pomora</span>
              <span className="text-indigo-500">Neo</span>
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