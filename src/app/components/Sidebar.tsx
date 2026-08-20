import {
  AudioLines,
  ListTodo,
  NotebookPen,
  Wallpaper,
  X,
} from 'lucide-react';
import { useState, type ComponentType, type ReactNode } from 'react';

import { cn } from '../../shared/utils/cn';
import { useHotkeys } from '../../shared/hooks/useHotkeys';
import { useTranslation } from '../../shared/i18n/useTranslation';

export type SidebarPanelKey = 'tasks' | 'audio' | 'notes' | 'wallpaper';

interface SidebarSection {
  key: SidebarPanelKey;
  icon: ComponentType<{ className?: string }>;
}

const SECTIONS: SidebarSection[] = [
  { key: 'tasks', icon: ListTodo },
  { key: 'audio', icon: AudioLines },
  { key: 'notes', icon: NotebookPen },
  { key: 'wallpaper', icon: Wallpaper },
];

const SECTION_KEYS: Record<SidebarPanelKey, 'sidebar.section.tasks' | 'sidebar.section.audio' | 'sidebar.section.notes' | 'sidebar.section.wallpaper'> = {
  tasks: 'sidebar.section.tasks',
  audio: 'sidebar.section.audio',
  notes: 'sidebar.section.notes',
  wallpaper: 'sidebar.section.wallpaper',
};

interface SidebarProps {
  tasks: ReactNode;
  audio: ReactNode;
  notes: ReactNode;
  wallpaper: ReactNode;
}

/**
 * Barra lateral colapsável (dock à esquerda no desktop, drawer no mobile).
 * Apenas ícones ficam visíveis; o painel expande quando o ícone é clicado.
 * Clicar no mesmo ícone recolhe; Esc também fecha o painel.
 */
export function Sidebar({ tasks, audio, notes, wallpaper }: SidebarProps) {
  const [active, setActive] = useState<SidebarPanelKey | null>(null);
  const { t } = useTranslation();

  const isOpen = active !== null;
  const content =
    active === 'tasks'
      ? tasks
      : active === 'audio'
        ? audio
        : active === 'notes'
          ? notes
          : active === 'wallpaper'
            ? wallpaper
            : null;

  const toggle = (key: SidebarPanelKey) => setActive((current) => (current === key ? null : key));
  const close = () => setActive(null);

  useHotkeys({ Escape: close }, [active]);

  return (
    <>
      {/* ===== Desktop: dock flutuante + painel expansível de vidro ===== */}
      <aside
        className="fixed inset-y-0 left-0 z-40 hidden items-center gap-4 pl-4 lg:flex"
        aria-label={t('sidebar.panels')}
      >
        <div className="flex flex-col items-center gap-2.5 rounded-2xl border border-zinc-200/50 bg-white/40 p-3 shadow-lg shadow-black/5 backdrop-blur-md dark:border-white/15 dark:bg-white/5 dark:shadow-black/30">
          {SECTIONS.map(({ key, icon: Icon }) => {
            const isActive = active === key;
            const label = t(SECTION_KEYS[key]);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggle(key)}
                aria-pressed={isActive}
                aria-expanded={isActive}
                aria-label={t('sidebar.openPanel', { label })}
                title={label}
                className={cn(
                  'group relative flex size-11 cursor-pointer items-center justify-center rounded-2xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                  isActive
                    ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.6)] ring-1 ring-white/30 scale-105'
                    : 'text-zinc-600 hover:scale-105 hover:bg-white/60 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/15 dark:hover:text-white',
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {isActive && (
                  <span
                    className="absolute -bottom-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div
          className={cn(
            'grid transition-[grid-template-columns] duration-300 ease-in-out',
            isOpen ? 'grid-cols-[360px]' : 'grid-cols-[0fr]',
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="h-[70vh] w-[360px] overflow-y-auto rounded-2xl border border-zinc-200/50 bg-white/50 p-3 shadow-xl shadow-black/5 backdrop-blur-xl dark:border-white/15 dark:bg-white/5 dark:shadow-black/40">
              {content}
            </div>
          </div>
        </div>
      </aside>

      {/* ===== Mobile: barra inferior flutuante + drawer sobreposto ===== */}
      <nav
        className="fixed inset-x-3 bottom-3 z-40 flex justify-around rounded-2xl border border-zinc-200/50 bg-white/40 py-1.5 shadow-lg shadow-black/5 backdrop-blur-xl lg:hidden dark:border-white/15 dark:bg-white/5 dark:shadow-black/30"
        aria-label={t('sidebar.panels')}
      >
        {SECTIONS.map(({ key, icon: Icon }) => {
          const isActive = active === key;
          const label = t(SECTION_KEYS[key]);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              aria-pressed={isActive}
              aria-label={t('sidebar.openPanel', { label })}
              className={cn(
                'flex cursor-pointer flex-col items-center gap-1 rounded-xl px-4 py-1.5 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100',
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </nav>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} aria-hidden="true" />
          <div className="absolute bottom-20 left-3 right-3 top-3 flex flex-col rounded-2xl border border-zinc-200/50 bg-white/60 shadow-2xl backdrop-blur-xl dark:border-white/15 dark:bg-zinc-900/60">
            <div className="flex items-center justify-between border-b border-zinc-100 p-3 dark:border-zinc-800">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                {active ? t(SECTION_KEYS[active]) : ''}
              </span>
              <button
                type="button"
                onClick={close}
                aria-label={t('sidebar.close')}
                className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-zinc-800"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">{content}</div>
          </div>
        </div>
      )}
    </>
  );
}