import type { ReactNode } from 'react';

import { PriorityBadge } from '../../../shared/components/ui/Badge';
import { Card } from '../../../shared/components/ui/Card';
import { cn } from '../../../shared/utils/cn';
import { TaskItem } from './TaskItem';
import { TodoListBody } from './TodoListBody';
import { TodoListHeader } from './TodoListHeader';

/**
 * Lista de Tarefas com prioridades — padrão Compound Components:
 *
 *   <TodoList>
 *     <TodoList.Header />   -> título + limpar concluídas
 *     <TodoList.Item />     -> linha individual
 *     <TodoList.PriorityBadge /> -> selo de prioridade
 *     <TodoList.Body />     -> corpo da lista
 *   </TodoList>
 */

interface TodoListProps {
  children: ReactNode;
  className?: string;
}

export function TodoList({ children, className }: TodoListProps) {
  return <Card className={cn('flex h-full flex-col', className)}>{children}</Card>;
}

TodoList.Header = TodoListHeader;
TodoList.Item = TaskItem;
TodoList.PriorityBadge = PriorityBadge;
TodoList.Body = TodoListBody;
