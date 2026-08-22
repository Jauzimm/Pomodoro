// ============================================================================
// TASKS SLICE — To-Do com prioridades e vínculo com o Pomodoro
// Camada: Application Logic (Zustand)
// ============================================================================

import type { StateCreator } from 'zustand';

import type { AppStore } from '../../app/store';
import type { Task, TaskPriority } from '../../core/types/domain';
import { generateId } from '../../shared/utils/id';
import { sortTasksByPriority } from './domain/taskSorting';

export interface TasksSlice {
  tasks: Task[];
  activeTaskId: string | null;
  addTask: (title: string, priority: TaskPriority, estimatedPomodoros?: number) => void;
  removeTask: (id: string) => void;
  toggleTask: (id: string) => void;
  editTask: (id: string, patch: Partial<Pick<Task, 'title' | 'priority' | 'estimatedPomodoros'>>) => void;
  reorderTask: (id: string, direction: -1 | 1) => void;
  setActiveTask: (id: string | null) => void;
  /** Incrementa o contador de pomodoros concluídos da tarefa ativa. */
  incrementActivePomodoro: () => void;
  clearCompleted: () => void;
}

export const sortTasks = sortTasksByPriority;

export const createTasksSlice: StateCreator<
  AppStore,
  [],
  [],
  TasksSlice
> = (set) => ({
  tasks: [],
  activeTaskId: null,

  addTask: (title, priority, estimatedPomodoros = 1) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const task: Task = {
      id: generateId(),
      title: trimmed,
      isCompleted: false,
      priority,
      estimatedPomodoros: Math.max(1, Math.min(50, estimatedPomodoros)),
      completedPomodoros: 0,
      createdAt: Date.now(),
    };
    set((state) => ({ tasks: [task, ...state.tasks] }));
  },

  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      activeTaskId: state.activeTaskId === id ? null : state.activeTaskId,
    })),

  toggleTask: (id) =>
    set((state) => {
      const target = state.tasks.find((t) => t.id === id);
      if (!target) return state;
      const willComplete = !target.isCompleted;
      return {
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, isCompleted: willComplete } : t,
        ),
        activeTaskId:
          willComplete && state.activeTaskId === id ? null : state.activeTaskId,
      };
    }),

  editTask: (id, patch) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),

  reorderTask: (id, direction) =>
    set((state) => {
      const sorted = sortTasksByPriority(state.tasks);
      const index = sorted.findIndex((t) => t.id === id);
      if (index === -1) return state;
      const target = index + direction;
      if (target < 0 || target >= sorted.length) return state;
      const [moved] = sorted.splice(index, 1);
      sorted.splice(target, 0, moved);
      return { tasks: sorted };
    }),

  setActiveTask: (id) => set({ activeTaskId: id }),

  incrementActivePomodoro: () =>
    set((state) => {
      if (!state.activeTaskId) return state;
      return {
        tasks: state.tasks.map((t) =>
          t.id === state.activeTaskId && !t.isCompleted
            ? { ...t, completedPomodoros: t.completedPomodoros + 1 }
            : t,
        ),
      };
    }),

  clearCompleted: () =>
    set((state) => ({
      tasks: state.tasks.filter((t) => !t.isCompleted),
      activeTaskId:
        state.activeTaskId && state.tasks.find((t) => t.id === state.activeTaskId)?.isCompleted
          ? null
          : state.activeTaskId,
    })),
});

export const selectTasks = (s: TasksSlice) => s.tasks;
export const selectActiveTaskId = (s: TasksSlice) => s.activeTaskId;
export const selectActiveTask = (s: TasksSlice) =>
  s.tasks.find((t) => t.id === s.activeTaskId) ?? null;
export const makeSelectIsActiveTask = (taskId: string) =>
  (s: TasksSlice): boolean => s.activeTaskId === taskId;
