import { sortTasksByPriority, sortTasksForDisplay } from '../src/modules/tasks/domain/taskSorting';
import type { Task } from '../src/core/types/domain';

function assert(condition: boolean, msg: string): void {
  if (!condition) {
    console.error('❌ Assertion failed:', msg);
    process.exit(1);
  }
}

console.log('🧪 Executando testes unitários de ordenação de tarefas...');

const task1: Task = {
  id: '1',
  title: 'Tarefa Baixa Prioridade',
  isCompleted: false,
  priority: 'LOW',
  estimatedPomodoros: 1,
  completedPomodoros: 0,
  createdAt: 1000,
};

const task2: Task = {
  id: '2',
  title: 'Tarefa Alta Prioridade Concluída',
  isCompleted: true,
  priority: 'HIGH',
  estimatedPomodoros: 2,
  completedPomodoros: 2,
  createdAt: 2000,
};

const task3: Task = {
  id: '3',
  title: 'Tarefa Média Prioridade',
  isCompleted: false,
  priority: 'MEDIUM',
  estimatedPomodoros: 1,
  completedPomodoros: 0,
  createdAt: 3000,
};

const task4: Task = {
  id: '4',
  title: 'Tarefa Alta Prioridade Não Concluída',
  isCompleted: false,
  priority: 'HIGH',
  estimatedPomodoros: 3,
  completedPomodoros: 0,
  createdAt: 4000,
};

const list = [task1, task2, task3, task4];

// 1. sortTasksByPriority (estrita por HIGH -> MEDIUM -> LOW)
const sortedByPrio = sortTasksByPriority(list);
assert(sortedByPrio[0].priority === 'HIGH', 'Primeira deve ser HIGH');
assert(sortedByPrio[1].priority === 'HIGH', 'Segunda deve ser HIGH');
assert(sortedByPrio[2].priority === 'MEDIUM', 'Terceira deve ser MEDIUM');
assert(sortedByPrio[3].priority === 'LOW', 'Quarta deve ser LOW');

// 2. sortTasksForDisplay (Não-concluídas primeiro, concluídas no fim)
const displaySorted = sortTasksForDisplay(list);
assert(displaySorted[0].id === '4', 'Primeira deve ser id 4 (Alta não concluída)');
assert(displaySorted[1].id === '3', 'Segunda deve ser id 3 (Média não concluída)');
assert(displaySorted[2].id === '1', 'Terceira deve ser id 1 (Baixa não concluída)');
assert(displaySorted[3].id === '2', 'Quarta deve ser id 2 (Alta porém concluída)');

console.log('✅ Todos os testes de ordenação de tarefas passaram com sucesso!');
