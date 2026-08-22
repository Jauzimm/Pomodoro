# AGENTS.md — PomoraNeo

App de estudos (timer Pomodoro + tarefas + notas + som ambiente). React 19 + TypeScript + Vite 8, Tailwind CSS v4 (plugin `@tailwindcss/vite`, **sem** `tailwind.config.js`), Zustand, lucide-react, clsx + tailwind-merge. UI em pt-BR.

> O README está desatualizado em pontos (cita tema claro/escuro e `useThemeEffect.ts`, que não existem mais) — confie no código e neste arquivo.

## Comandos

```bash
npm install                       # instalar dependências
npm run dev                       # dev server (Vite)
npm run build                     # tsc -b && vite build — rode antes de concluir
npm run lint                      # oxlint (sem flags extras)
npm run preview                   # serve o build de produção
```

- Testes unitários em `tests/*.test.ts` (asserts puros, sem framework): rode com `npx tsx tests/<arquivo>.test.ts` (`tsx` não é dependência; `npx` baixa sob demanda). Suíte atual: `timer.fsm`, `eventBus`, `stateMigration`, `taskSorting`.
- FSM do timer é pura (sem DOM): os testes cobrem isso; smoke test pontual segue o mesmo padrão `npx tsx <arquivo>`.
- Para reproduzir crash de render (tela em branco só com fundo): `renderToStaticMarkup` de `App` com `react-dom/server` + shims de `window`/`document`/`navigator`/`localStorage` (e um valor obsoeto no localStorage para simular estado persistido). Roda com `npx tsx --tsconfig tsconfig.app.json <arquivo>.tsx`.

## Arquitetura

Camadas (Clean Architecture leve, Feature-First). Dependências apontam para baixo: UI → slices/hooks → core. Nunca importe `app/store` de dentro de `core/` (exceto `import type` de slices).

```
src/
├── app/            # App.tsx (layout), store.ts (slices + persist), storage.ts,
│   │               # schema/stateMigration.ts (sanitização do estado persistido),
│   │               # useAppEffects (orquestrador de efeitos), useShortcuts, useZenMode, Header, Sidebar
├── core/           # Regras puras, sem React/DOM
│   ├── types/domain.ts        # Contratos (TimerState, Task, AudioSettings…)
│   ├── constants/index.ts     # Defaults 25/5/15, limites, metadados de UI
│   ├── domain/timer.fsm.ts    # FSM pura declarativa: timerReducer + eventos ON_*
│   ├── domain/eventBus.ts     # Observer: 'timer:completed' | 'timer:phase-changed'
│   └── adapters/storage.adapter.ts  # StorageAdapter<T> + LocalStorageAdapter
├── modules/        # 1 pasta por funcionalidade: timer, tasks, notes, audio, settings, wallpaper
│   └── <modulo>/
│       ├── components/          # componentes React (PascalCase, named export)
│       ├── hooks/               # hooks de efeito/observadores
│       ├── domain/              # regras puras do módulo (ex.: tasks: taskSorting, taskConstants)
│       ├── engine|services|strategies/  # lógica de aplicação (audio: engine/ + strategies/)
│       └── *.slice.ts           # slice Zustand + seletores granulares
└── shared/         # ui (Button, Modal, Card, Slider, Switch, Badge, particles/),
                    # hooks, i18n (translations/labels/detect), utils (cn, formatTime, id, math)
```

* **Store:** `src/app/store.ts` compõe slices via `createTimerSlice(set, get, api)`. Persist com `partialize` (timer em execução NUNCA é persistido). Chave: `studyspace:app-state:v1`; o `merge` delega a `sanitizePersistedState` em `src/app/schema/stateMigration.ts`, que valida/corrige cada campo contra os defaults (nunca confie no estado vindo do localStorage).
* **Fluxo de conclusão de ciclo:** FSM (`ON_TICK` → `COMPLETED_CYCLE`) → slice aplica `ON_COMPLETE` → emite `timer:completed` no eventBus → assinantes desacoplados: alarme (audio), Notification API (settings), incremento da tarefa ativa (tasks).
* **Efeitos globais:** `App.tsx` é só layout — toda inicialização de serviços (ticking, áudio, notificações, wallpaper, atalhos, zen) passa pelo hook orquestrador `src/app/useAppEffects.ts`.
* **Áudio (Strategy Pattern):** `AudioController` resolve a primeira estratégia capaz (`HtmlAudioFileStrategy` → `WebAudioSynthStrategy`); síntese é o fallback garantido e também é injetada na HTML para falhas de runtime. A síntese vive em `modules/audio/engine/` (`audioContextManager` = singleton lazy do `AudioContext`; `ambientGenerators`; `synthAlerts`) — estratégias apenas orquestram.
* **Partículas 3D:** `shared/components/ui/ParticleCanvas.tsx` renderiza paralaxe em 3 camadas de profundidade com cauda dinâmica; motor decomposto em `shared/components/ui/particles/` (`particleTypes`, `particleFactory`, `particleRenderer`). As cores vêm da paleta do wallpaper ativo (`wallpaperColorExtractor` + `colorQuantizer` puro). Toggle `particlesEnabled` no SettingsModal; default é `true`.
* **Plano de fundo (wallpaper):** presets são SVGs em `public/wallpapers/` (assets próprios, sem rede); uploads customizados viram data URLs persistidas no localStorage — respeite os limites de `presets.ts` (2 MB por imagem, máx. 5) ou a cota de ~5MB estoura. Aplicação via `useWallpaperEffect` (define `background-image` + classe `ss-wallpaper` no `body`, com overlay de legibilidade).
* **Layout:** tela principal = só `PomodoroCard`. Tarefas/Áudio/Notas/Plano de fundo vivem na `Sidebar` colapsável (rail de ícones + painel 360px desktop, drawer + bottom bar no mobile).
* **Modo Zen:** durante FOCO em execução, `useZenMode` oculta controles após 10s sem mouse/tecla (prop `zenHidden` em Header/Sidebar/PomodoroCard); qualquer movimento/clique/tecla revela. Fora de foco rodando, nunca esconde.
* **Deploy & segurança:** deploy na Vercel; `<Analytics />` de `@vercel/analytics/react` está no `App.tsx`. Headers de segurança (CSP, X-Frame-Options, HSTS etc.) vivem em `vercel.json` — se adicionar domínio externo (script/connect/img), atualize o CSP correspondente. Uploads de wallpaper são validados no upload (data URL + limites) e re-sanitizados ao aplicar (`sanitizeCssUrl` em `useWallpaperEffect`, whitelist de esquemas + escape para `background-image`).

## Seções

* **Nomenclatura:** componentes React em PascalCase com named export (`export function Button()`). Hooks `use*`. Tipos de domínio PascalCase. Constantes SCREAMING_SNAKE.
* **Tipagem estrita:** `tsconfig` com `erasableSyntaxOnly` — proibido usar parameter properties (`constructor(private x)`) e enums; use unions literais e campos explícitos. Como também há `verbatimModuleSyntax`, todo import só de tipo **precisa** de `import type` (senão quebra no build, não só warning).
* **Seletores Zustand:** use seletores granulares (`useStore(selectTimeLeft)`) — nunca `useStore()` sem seletor nem objetos derivados em `useMemo` para `selectActiveTask`-like; o timer atualiza 1×/segundo e não pode re-renderizar Tasks/Notas.
* **Slices:** recebem `set`/`get` do store composto. Ações com efeito colateral (ex.: `tick`) calculam transição fora do `set` e emitem eventos após aplicar. `import type { AppStore }` é aceitável (type-only) de slices para `app/store`.
* **UI:** Tailwind v4 — tema escuro **permanente** (classe `.dark` fixa no `<html>` em `index.html`; variante customizada em `index.css`); não há modo claro nem toggle. Cores slate/zinc; `rounded-2xl`; `cn()` de `shared/utils/cn` para conciliar classes. Ícones sempre de `lucide-react` (verificar existência no pacote antes de usar).
* **Áudio:** toda reprodução passa pelo `audioController` singleton — nunca `new Audio()`/`AudioContext` fora de `modules/audio/` (`strategies/` orquestram; `engine/` detém o contexto e a síntese). `canPlay*` é assíncrono e verifica Content-Type (NÃO apenas `res.ok`). MP3s em `public/sounds/` (alertas) e `public/sounds/ambient/` são a fonte **preferida** e casam com um `SoundAlertPreset`/`AmbientSoundType` via nome de arquivo; a síntese Web Audio é o fallback quando o arquivo falta. **Não remova esses MP3** — voltaria tudo para síntese. Ruído branco só existe na síntese (sem equivalente gravado).
* **i18n:** toda string visível do usuário vem de `src/shared/i18n/translations.ts` (chaves `TranslationKey`, dicionários `pt`/`en`/`es`); use `const { t } = useTranslation()` e `t('chave', { param })` (interpolação `{param}`). Modos/fases da FSM: `t(modeKey(mode))` / `t(phaseKey(phase))` de `shared/i18n/labels`. Nunca hardcode texto na UI. Idioma (`AppLanguage = 'pt'|'en'|'es'`, **sem** `'auto'`) fica no `SettingsSlice`; o default é `detectBrowserLanguage()` (navegador) em `shared/i18n/detect.ts`, e o seletor em `SettingsModal` mostra só 3 opções. Adicione novas chaves nos 3 idiomas. `translate()`/`resolveLanguage()` são defensivos contra valores obsoletos persistidos (não lançam).
* **Comentários:** cabeçalho de bloco com `====` em arquivos de camada core/application; `//` inline em código ambíguo.
* **A11y:** controles com `aria-label`, modais com foco retido + Esc, atalhos via `useHotkeys` (Espaço/R/S — pulados em inputs e botões focados).

## Qualidade antes de concluir

```bash
npm run build   # typecheck (tsc -b) + build — sem erros TS
npm run lint    # oxlint — sem erros (warnings aceitos: only-export-components em TodoList/PrioritySelector, set-state-in-effect em useMediaQuery/Scratchpad)
```

* Rode a suíte relevante com `npx tsx tests/<arquivo>.test.ts`: alterou FSM/eventBus → `timer.fsm` + `eventBus`; persistência/i18n → `stateMigration`; ordenação de tarefas → `taskSorting`.
* Se alterar `core/domain/timer.fsm.ts` ou o fluxo de ciclos: valide a sequência 4×Foco → Descanso Longo → novo bloco (`tests/timer.fsm.test.ts` cobre; smoke test pontual se precisar de cenário novo).
* Se alterar áudio: testar manualmente no navegador — pré-escuta, ambientes, mute e alarme ao completar ciclo (verificar console do Firefox para erros `text/html`).
* Persistência: recarregar a página preserva config/tasks/notes/audio/wallpaper; o timer volta para IDLE.

## O que NÃO Fazer (Regras Críticas)

* ❌ Não adicionar dependências de runtime sem necessidade (estado é Zustand; síntese de som é Web Audio nativa; zero assets de áudio obrigatórios).
* ❌ Não importar `window`/`localStorage`/`AudioContext` em `core/` (camada pura — use adapters/strategies).
* ❌ Não confiar em `setInterval(1000)` para o timer: o tique usa delta de `performance.now()` em `modules/timer/services/ticking.ts`.
* ❌ Não chamar `timerReducer` dentro de `set()` do Zustand — compute antes, depois aplique e emita eventos.
* ❌ Não usar parameter properties (`constructor(private x: T)`) — `erasableSyntaxOnly` quebra o build.
* ❌ Não tocar em `public/sounds/` esperando fallback automático: arquivos ausentes fazem o Vite dev retornar 200+`text/html`; a detecção correta já filtra por Content-Type.
* ❌ Não remover o spacer `<div className="h-28 lg:hidden">` do App — a bottom bar mobile é `fixed` e o cobre.
* ❌ Não persistir `timeLeft`/`status` do timer — o `partialize` em `app/store.ts` é a fonte da verdade.
* ❌ Nunca rodar `npm run build` fora da raiz do projeto nem usar `npm i -g` para dependências do projeto.
* ❌ Não mudar o formato do estado persistido (`studyspace:app-state:v1`) sem sanitizar no `merge`: um valor obsoeto no localStorage (ex.: `language: 'auto'` depois de remover a opção) faz `t()` lançar em **todo** componente → app em branco, só o fundo. Toda validação/correção vive em `src/app/schema/stateMigration.ts` (`sanitizePersistedState` + sanitizers por campo) com cobertura em `tests/stateMigration.test.ts` — mantenha esse padrão para qualquer campo cujo domínio possa encolher.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, cross-file relationships, and an agent-crawlable wiki.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- **Obrigatoriedade do Grafo (Graph-First Exploration):** Para entender fluxos, relações entre módulos, depurar lógica ou responder perguntas sobre a base de código, NUNCA faça varredura manual cega de arquivos brutos. Execute PRIMEIRO `graphify query "<pergunta>"`, `graphify path "<A>" "<B>"` para mapear relações ou `graphify explain "<conceito>"`.
- **Navegação via Wiki:** Sempre utilize `graphify-out/wiki/index.md` e os artigos de comunidade (`graphify-out/wiki/community-*.md`) para navegação estruturada antes de abrir múltiplos arquivos.
- **Tolerância a arquivos dirty:** Arquivos em `graphify-out/` podem ficar dirty após hooks ou updates; nunca ignore o graphify por isso.
- **Revisão arquitetural:** Consulte `graphify-out/GRAPH_REPORT.md` quando query/path/explain não trouxerem contexto amplo o suficiente.
- **Sincronização contínua:** Após qualquer alteração de código, execute `graphify update .` para manter o grafo atualizado (AST-only, sem custo de API).
