import { DomainEventBus } from '../src/core/domain/eventBus';

function assert(condition: boolean, msg: string): void {
  if (!condition) {
    console.error('❌ Assertion failed:', msg);
    process.exit(1);
  }
}

console.log('🧪 Executando testes unitários do DomainEventBus...');

const bus = new DomainEventBus();

let completedCount = 0;
let lastMode = '';

// 1. Inscrição básica
const unsub1 = bus.subscribe('timer:completed', (e) => {
  completedCount++;
  lastMode = e.completedMode;
});

bus.emit('timer:completed', { completedMode: 'FOCUS', totalCompletedSessions: 1 });
assert(completedCount === 1, 'Contador deve ser 1');
assert(lastMode === 'FOCUS', 'Modo deve ser FOCUS');

// 2. Isolamento de Falhas (Error Isolation)
let secondListenerCalled = false;
bus.subscribe('timer:completed', () => {
  throw new Error('Falha simulada em listener do plugin');
});

bus.subscribe('timer:completed', () => {
  secondListenerCalled = true;
});

// A emissão NÃO deve explodir nem impedir o segundo listener
bus.emit('timer:completed', { completedMode: 'SHORT_BREAK', totalCompletedSessions: 1 });
assert(secondListenerCalled === true, 'Segundo listener deve ser chamado mesmo após erro no primeiro');
assert(completedCount === 2, 'Primeiro listener deve ter sido chamado 2 vezes');
assert(lastMode === 'SHORT_BREAK', 'Modo deve ser SHORT_BREAK');

// 3. Unsubscribe
unsub1();
bus.emit('timer:completed', { completedMode: 'FOCUS', totalCompletedSessions: 2 });
assert(completedCount === 2, 'Contador não deve mudar após desinscrição');

console.log('✅ Todos os testes do DomainEventBus passaram com sucesso!');
