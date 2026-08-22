import { useTranslation } from '../shared/i18n/useTranslation';
import { PomodoroCard } from '../modules/timer/components/PomodoroCard';
import { TodoList } from '../modules/tasks/components/TodoList';
import { TaskForm } from '../modules/tasks/components/TaskForm';
import { Scratchpad } from '../modules/notes/components/Scratchpad';
import { AmbientSoundMixer } from '../modules/audio/components/AmbientSoundMixer';
import { AlertSoundSelector } from '../modules/audio/components/AlertSoundSelector';
import { WallpaperPicker } from '../modules/wallpaper/components/WallpaperPicker';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from '../shared/components/ui/Card';
import { AudioLines, ListTodo, NotebookPen, Volume2, Wallpaper } from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar, type SidebarSection } from './components/Sidebar';
import { ParticleCanvas } from '../shared/components/ui/ParticleCanvas';
import { useAppEffects } from './useAppEffects';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

/**
 * Aplicação PomoraNeo: orquestra módulos, hooks de efeito e o layout.
 *
 * Layout: apenas o timer Pomodoro ocupa a tela principal; Tarefas, Áudio e
 * Anotações ficam em uma barra lateral colapsável (ícones → painel expansível).
 */
export default function App() {
  const { t } = useTranslation();
  // Inicializa todos os serviços/observadores (timer, áudio, tarefas, notificações, zen mode).
  const { zenHidden } = useAppEffects();

  const sidebarSections: SidebarSection[] = [
    {
      key: 'tasks',
      icon: ListTodo,
      labelKey: 'sidebar.section.tasks',
      content: (
        <TodoList>
          <TodoList.Header />
          <CardBody className="pt-2">
            <TaskForm />
          </CardBody>
          <TodoList.Body />
        </TodoList>
      ),
    },
    {
      key: 'audio',
      icon: AudioLines,
      labelKey: 'sidebar.section.audio',
      content: (
        <Card>
          <CardHeader>
            <CardTitle>
              <Volume2 className="size-4 text-indigo-500" aria-hidden="true" />
              {t('app.audio')}
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-5">
            <AmbientSoundMixer />
            <div className="h-px bg-zinc-100 dark:bg-zinc-800" aria-hidden="true" />
            <AlertSoundSelector />
          </CardBody>
        </Card>
      ),
    },
    {
      key: 'notes',
      icon: NotebookPen,
      labelKey: 'sidebar.section.notes',
      content: <Scratchpad />,
    },
    {
      key: 'wallpaper',
      icon: Wallpaper,
      labelKey: 'sidebar.section.wallpaper',
      content: <WallpaperPicker />,
    },
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      <ParticleCanvas />
      <Header zenHidden={zenHidden} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar sections={sidebarSections} zenHidden={zenHidden} />

        {/* Área principal: o timer é o protagonista, sem outros módulos. */}
        <main className="flex flex-1 flex-col items-center overflow-y-auto px-4 pb-16 pt-20 sm:pt-24">
          <div className="flex w-full flex-1 flex-col items-center justify-center">
            <PomodoroCard zenHidden={zenHidden} />
          </div>
        </main>
      </div>

      {/* Dica do Modo Zen: surge apenas quando os controles estão ocultos. */}
      {zenHidden && (
        <div
          className="pointer-events-none fixed bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/10 bg-black/50 px-4 py-1.5 text-xs font-medium text-zinc-200 shadow-lg backdrop-blur-md"
          aria-hidden="true"
        >
          {t('zen.hint')}
        </div>
      )}

      {/* Espaço reservado para a barra de navegação inferior no mobile. */}
      <div className="h-28 lg:hidden" aria-hidden="true" />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}