import { useNotifications } from '../modules/settings/hooks/useNotifications';
import { useTranslation } from '../shared/i18n/useTranslation';
import { useAudioController } from '../modules/audio/hooks/useAudioController';
import { useTaskPomodoroTracking } from '../modules/tasks/hooks/useTaskPomodoroTracking';
import { useTickingTimer } from '../modules/timer/hooks/useTickingTimer';
import { useTimerTitleSync } from '../modules/timer/hooks/useTimerTitleSync';
import { PomodoroCard } from '../modules/timer/components/PomodoroCard';
import { TodoList } from '../modules/tasks/components/TodoList';
import { TaskForm } from '../modules/tasks/components/TaskForm';
import { Scratchpad } from '../modules/notes/components/Scratchpad';
import { AmbientSoundMixer } from '../modules/audio/components/AmbientSoundMixer';
import { AlertSoundSelector } from '../modules/audio/components/AlertSoundSelector';
import { WallpaperPicker } from '../modules/wallpaper/components/WallpaperPicker';
import { useWallpaperEffect } from '../modules/wallpaper/hooks/useWallpaperEffect';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from '../shared/components/ui/Card';
import { Volume2 } from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ParticleCanvas } from '../shared/components/ui/ParticleCanvas';
import { useShortcuts } from './useShortcuts';
import { useZenMode } from './useZenMode';

/**
 * Aplicação PomoraNeo: orquestra módulos, hooks de efeito e o layout.
 *
 * Layout: apenas o timer Pomodoro ocupa a tela principal; Tarefas, Áudio e
 * Anotações ficam em uma barra lateral colapsável (ícones → painel expansível).
 */
export default function App() {
  // Hooks de efeito/observadores (todos desacoplados via slices + event bus).
  const { t } = useTranslation();
  useTickingTimer();
  useTimerTitleSync();
  useAudioController();
  useTaskPomodoroTracking();
  useNotifications();
  useShortcuts();
  useWallpaperEffect();
  const zenHidden = useZenMode();

  return (
    <div className="flex min-h-dvh flex-col">
      <ParticleCanvas />
      <Header zenHidden={zenHidden} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          zenHidden={zenHidden}
          tasks={
            <TodoList>
              <TodoList.Header />
              <CardBody className="pt-2">
                <TaskForm />
              </CardBody>
              <TodoList.Body />
            </TodoList>
          }
          audio={
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
          }
          notes={<Scratchpad />}
          wallpaper={<WallpaperPicker />}
        />

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
    </div>
  );
}