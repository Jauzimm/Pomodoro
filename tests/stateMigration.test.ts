import {
  sanitizeLanguage,
  sanitizePersistedState,
  sanitizePomodoroConfig,
} from '../src/app/schema/stateMigration';
import { DEFAULT_POMODORO_CONFIG } from '../src/core/constants';
import type { AppStore } from '../src/app/store';

function assert(condition: boolean, msg: string): void {
  if (!condition) {
    console.error('❌ Assertion failed:', msg);
    process.exit(1);
  }
}

console.log('🧪 Executando testes unitários do StateMigration e Schema Validator...');

// 1. Config com valores inválidos / strings corrompidas
const corruptedConfig = {
  focusDuration: '25', // Inválido (string)
  shortBreakDuration: -5, // Inválido (negativo)
  longBreakDuration: NaN, // Inválido (NaN)
  cyclesBeforeLongBreak: 999, // Fora dos limites
  autoStartBreaks: 'sim', // Inválido (não booleano)
  autoStartPomodoros: true,
};

const sanitizedConfig = sanitizePomodoroConfig(corruptedConfig);
assert(sanitizedConfig.focusDuration === DEFAULT_POMODORO_CONFIG.focusDuration, 'focusDuration deve voltar ao default');
assert(sanitizedConfig.shortBreakDuration === DEFAULT_POMODORO_CONFIG.shortBreakDuration, 'shortBreakDuration deve voltar ao default');
assert(sanitizedConfig.longBreakDuration === DEFAULT_POMODORO_CONFIG.longBreakDuration, 'longBreakDuration deve voltar ao default');
assert(sanitizedConfig.cyclesBeforeLongBreak === 12, 'cyclesBeforeLongBreak deve sofrer clamp em 12');
assert(sanitizedConfig.autoStartBreaks === DEFAULT_POMODORO_CONFIG.autoStartBreaks, 'autoStartBreaks deve voltar ao default');
assert(sanitizedConfig.autoStartPomodoros === true, 'autoStartPomodoros válido deve ser preservado');

// 2. Idioma obsoleto (ex: 'auto' removido da UI)
assert(sanitizeLanguage('auto') === 'pt' || sanitizeLanguage('auto') === 'en' || sanitizeLanguage('auto') === 'es', 'Idioma obsoleto deve resolver para detectado');
assert(sanitizeLanguage('es') === 'es', 'Idioma válido deve ser preservado');

// 3. Estado completo corrompido
const mockInitialStore = {
  config: { ...DEFAULT_POMODORO_CONFIG },
  tasks: [],
  activeTaskId: null,
  note: { content: '', lastUpdated: 0 },
  audio: { alertSound: 'TIBETAN_BOWL', alertVolume: 0.6, ambientType: null, ambientVolume: 0.4, isMuted: false },
  notificationsEnabled: false,
  particlesEnabled: true,
  language: 'pt',
  activeWallpaperId: null,
  customWallpapers: [],
  timer: { mode: 'FOCUS', status: 'IDLE', timeLeft: 1500, currentCycle: 1, totalCompletedSessions: 0 },
} as unknown as AppStore;

const merged = sanitizePersistedState(null, mockInitialStore);
assert(merged.config.focusDuration === 25, 'Merge de null deve preservar estado inicial');

const partiallyPersisted = {
  config: { focusDuration: 30, shortBreakDuration: 10, longBreakDuration: 20, cyclesBeforeLongBreak: 4, autoStartBreaks: false, autoStartPomodoros: false },
  totalCompletedSessions: 12,
  language: 'en',
  tasks: [
    { id: 'task-1', title: 'Task 1', isCompleted: false, priority: 'HIGH', estimatedPomodoros: 2, completedPomodoros: 1, createdAt: 100 },
    { id: 'task-invalid', title: 123 }, // Inválido (title não string)
    null, // Inválido
  ],
  wallpaper: {
    activeWallpaperId: 'custom-1',
    customWallpapers: [
      { id: 'custom-1', name: 'Wallpaper 1', dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' },
      { id: 'custom-bad', name: 'Bad', dataUrl: 'javascript:alert(1)' }, // Inválido (esquema inseguro)
    ],
  },
};

const result = sanitizePersistedState(partiallyPersisted, mockInitialStore);
assert(result.config.focusDuration === 30, 'Config persistida válida deve ser carregada');
assert(result.timer.totalCompletedSessions === 12, 'TotalCompletedSessions deve ser carregado');
assert(result.language === 'en', 'Language deve ser carregado');
assert(result.tasks.length === 1, 'Apenas tasks válidas devem ser carregadas');
assert(result.customWallpapers.length === 1, 'Apenas wallpapers com data:image/ válidos devem ser carregados');

console.log('✅ Todos os testes do StateMigration passaram com sucesso!');
