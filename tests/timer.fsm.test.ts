import {
  canPause,
  canStart,
  durationOf,
  phaseOf,
  timerReducer,
} from '../src/core/domain/timer.fsm';
import { INITIAL_TIMER_STATE } from '../src/core/constants';
import type { PomodoroConfig, TimerState } from '../src/core/types/domain';

function assert(condition: boolean, msg: string): void {
  if (!condition) {
    console.error('❌ Assertion failed:', msg);
    process.exit(1);
  }
}

console.log('🧪 Executando testes unitários da FSM do Timer...');

const config: PomodoroConfig = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  cyclesBeforeLongBreak: 4,
  autoStartBreaks: true,
  autoStartPomodoros: false,
};

// 1. Teste de Duração
assert(durationOf(config, 'FOCUS') === 25 * 60, 'Duração de foco deve ser 25m');
assert(durationOf(config, 'SHORT_BREAK') === 5 * 60, 'Duração de descanso curto deve ser 5m');
assert(durationOf(config, 'LONG_BREAK') === 15 * 60, 'Duração de descanso longo deve ser 15m');

// 2. Teste de Transição de Início
let state: TimerState = { ...INITIAL_TIMER_STATE };
assert(canStart(state) === true, 'Estado inicial deve permitir início');
assert(canPause(state) === false, 'Estado inicial não deve permitir pausa');

let t = timerReducer(state, { type: 'ON_START' }, config);
assert(t.state.status === 'RUNNING', 'Status deve ser RUNNING');
assert(t.phase === 'RUNNING_FOCUS', 'Phase deve ser RUNNING_FOCUS');
assert(phaseOf(t.state) === 'RUNNING_FOCUS', 'phaseOf deve retornar RUNNING_FOCUS');
state = t.state;

// 3. Teste de Pausa
assert(canPause(state) === true, 'Estado em execução deve permitir pausa');
t = timerReducer(state, { type: 'ON_PAUSE' }, config);
assert(t.state.status === 'PAUSED', 'Status deve ser PAUSED');
assert(t.phase === 'PAUSED_FOCUS', 'Phase deve ser PAUSED_FOCUS');
state = t.state;

// 4. Retomada e Tique
t = timerReducer(state, { type: 'ON_START' }, config);
state = t.state;

t = timerReducer(state, { type: 'ON_TICK', secondsElapsed: 10 }, config);
assert(t.kind === 'NEXT', 'Kind deve ser NEXT');
assert(t.state.timeLeft === 25 * 60 - 10, 'TimeLeft deve decrescer 10s');
state = t.state;

// 5. Tique até conclusão do ciclo
t = timerReducer(state, { type: 'ON_TICK', secondsElapsed: state.timeLeft }, config);
assert(t.kind === 'COMPLETED_CYCLE', 'Kind deve ser COMPLETED_CYCLE');
assert(t.phase === 'COMPLETED', 'Phase deve ser COMPLETED');
if (t.kind === 'COMPLETED_CYCLE') {
  assert(t.completedMode === 'FOCUS', 'CompletedMode deve ser FOCUS');
}

// 6. Avanço pós-completude (Ciclo 1 Foco -> Descanso Curto)
t = timerReducer(t.state, { type: 'ON_COMPLETE' }, config);
assert(t.state.mode === 'SHORT_BREAK', 'Modo deve ser SHORT_BREAK');
assert(t.state.currentCycle === 2, 'Ciclo deve avançar para 2');
assert(t.state.totalCompletedSessions === 1, 'Total de sessões deve ser 1');
assert(t.state.status === 'IDLE', 'Status deve ser IDLE');
assert(t.state.timeLeft === 5 * 60, 'TimeLeft deve ser 5m');
state = t.state;

// 7. Simulação do ciclo completo (4 focos -> Long Break)
for (let c = 2; c <= 4; c++) {
  // Descanso
  t = timerReducer(state, { type: 'ON_START' }, config);
  t = timerReducer(t.state, { type: 'ON_TICK', secondsElapsed: t.state.timeLeft }, config);
  t = timerReducer(t.state, { type: 'ON_COMPLETE' }, config);
  assert(t.state.mode === 'FOCUS', 'Deve voltar para FOCUS');
  state = t.state;

  // Foco
  t = timerReducer(state, { type: 'ON_START' }, config);
  t = timerReducer(t.state, { type: 'ON_TICK', secondsElapsed: t.state.timeLeft }, config);
  t = timerReducer(t.state, { type: 'ON_COMPLETE' }, config);
  state = t.state;

  if (c === 4) {
    assert(state.mode === 'LONG_BREAK', 'Após 4º foco, deve ir para LONG_BREAK');
    assert(state.totalCompletedSessions === 4, 'Total de sessões deve ser 4');
    assert(state.timeLeft === 15 * 60, 'Tempo de descanso longo deve ser 15m');
  }
}

// 8. Descanso longo concluído -> Volta para Foco e reseta ciclo para 1
t = timerReducer(state, { type: 'ON_START' }, config);
t = timerReducer(t.state, { type: 'ON_TICK', secondsElapsed: t.state.timeLeft }, config);
t = timerReducer(t.state, { type: 'ON_COMPLETE' }, config);
assert(t.state.mode === 'FOCUS', 'Deve voltar para FOCUS');
assert(t.state.currentCycle === 1, 'Ciclo deve resetar para 1');

// 9. Teste de Reset
t = timerReducer(t.state, { type: 'ON_START' }, config);
t = timerReducer(t.state, { type: 'ON_RESET' }, config);
assert(t.state.status === 'IDLE', 'Status deve ser IDLE após reset');
assert(t.state.timeLeft === 25 * 60, 'TimeLeft deve resetar para 25m');

console.log('✅ Todos os testes da FSM passaram com sucesso!');
