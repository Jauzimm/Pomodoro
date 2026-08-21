# PomoraNeo

Aplicação web completa de alta produtividade para estudos: **timer Pomodoro com FSM**, **tarefas com prioridades**, **bloco de anotações** e **mixer de áudio ambiente Lo-Fi/ruídos** — tudo em React + TypeScript + Tailwind CSS + Zustand.

## Stack

- **React 19 + TypeScript (Vite 8)**
- **Tailwind CSS v4** (tema dark/light por classe, paleta slate/zinc)
- **Zustand** (estado global por slices desacoplados)
- **lucide-react** (ícones)
- **Web Audio API** (síntese de alarmes e ambientes, zero assets)

## Executando

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # build de produção
npm run preview  # servir o build
npm run lint     # oxlint
```

## Estrutura de Diretórios (Feature-First)

```
src/
├── app/                      # Setup do App, Providers, layout e efeitos
│   ├── App.tsx               # Orquestra hooks de efeito + layout em grid
│   ├── main.tsx
│   ├── store.ts              # Store Zustand unificado (slices + persist)
│   ├── storage.ts            # Bridge persist ↔ StorageAdapter do core
│   ├── useThemeEffect.ts     # Aplica a classe `.dark` no <html>
│   ├── useShortcuts.ts       # Atalhos: Espaço, R, S
│   └── components/Header.tsx
├── core/                     # Regras puras e abstrações agnósticas de framework
│   ├── types/domain.ts       # Contratos rígidos (Timer, Task, Note, Audio…)
│   ├── constants/            # Defaults (25/5/15, 4 ciclos) e metadados de UI
│   ├── domain/
│   │   ├── timer.fsm.ts      # FSM determinística pura (8 estados + reducer)
│   │   └── eventBus.ts       # Observer: evento `timer:completed` desacoplado
│   └── adapters/
│       └── storage.adapter.ts # StorageAdapter<T> + LocalStorageAdapter
├── modules/                  # Módulos encapsulados por funcionalidade
│   ├── timer/
│   │   ├── components/       # PomodoroCard, CircularProgress, Controls…
│   │   ├── hooks/            # useTickingTimer, useTimerTitleSync
│   │   ├── services/ticking.ts # delta-time via performance.now (sem drift)
│   │   └── timer.slice.ts
│   ├── tasks/
│   │   ├── components/       # TodoList (compound), TaskForm, PrioritySelector
│   │   ├── hooks/            # useSortedTasks, useTaskPomodoroTracking
│   │   └── tasks.slice.ts
│   ├── notes/
│   │   ├── components/       # Scratchpad (auto-save com debounce)
│   │   └── notes.slice.ts
│   ├── audio/
│   │   ├── components/       # AmbientSoundMixer, AlertSoundSelector
│   │   ├── strategies/       # WebAudioSynth + HtmlAudioFile (Strategy Pattern)
│   │   ├── hooks/useAudioController.ts
│   │   └── audio.slice.ts
│   └── settings/
│       ├── components/       # SettingsModal (foco retido, Esc fecha)
│       └── settings.slice.ts
└── shared/                   # Componentes e utilitários reutilizáveis
    ├── components/ui/        # Button, Modal, Slider, Switch, Card, Badge
    ├── hooks/                # useLocalStorage, useDebounce, useMediaQuery, useHotkeys
    └── utils/                # cn, formatTime, soundGenerators
```

## Arquitetura & Padrões

| Camada | Responsabilidade |
| --- | --- |
| **Presentation** | Componentes React + Tailwind (Compound Components no TodoList/Modal) |
| **Application** | Slices Zustand + hooks (presenters/controllers) |
| **Core Domain** | FSM pura do timer, tipos, barramento de eventos (Observer) |
| **Infrastructure** | `StorageAdapter`, `WebAudioSynthStrategy`, `HtmlAudioFileStrategy` |

### Destaques técnicos

- **Timer sem drift:** tique por delta de tempo real (`performance.now()`), acumulando frações e despachando segundos inteiros — preciso mesmo com a aba minimizada.
- **FSM determinística:** estados `IDLE / RUNNING_* / PAUSED_* / COMPLETED` com reducer puro; eventos `ON_TICK / ON_START / ON_PAUSE / ON_SKIP / ON_RESET / ON_COMPLETE`.
- **Strategy Pattern no áudio:** a UI fala apenas com `AudioStrategy`; o `AudioController` resolve a primeira estratégia capaz (arquivos `.mp3` em `public/sounds/` → fallback para síntese Web Audio).
- **Observer:** o fim do ciclo publica `timer:completed` — o alarme toca, a Notification API avisa e a tarefa ativa incrementa pomodoros, sem acoplamento direto.
- **Re-renders isolados:** seletores granulares no Zustand (`selectTimeLeft`) para que o display de segundos não re-renderize a To-Do List/Notas.
- **Persistência resiliente:** `LocalStorageAdapter` com validação de schema e fallback gracioso (cota cheia/parse inválido).
- **A11y:** modal com foco retido, `aria-label` em controles, atalhos de teclado (Espaço, R, S, Esc).
- **Autoplay:** `AudioContext` desbloqueado no primeiro gesto do usuário (`resume()`).

### Sons

- **Alarmes (canal primário):** Sino Tibetano, Alarme Digital, Gongo Relaxante e Bip Suave — sintetizados via Web Audio API. Coloque arquivos em `public/sounds/<PRESET>.mp3` para usar a estratégia HTML (ex.: `public/sounds/tibetan_bowl.mp3`).
- **Ambiente (canal secundário):** Lo-Fi Beats (progressão de acordes generativa com crackle de vinil), Chuva, Cafeteria, Lareira e Ruído Branco, com volume independente e mute rápido na barra superior.
