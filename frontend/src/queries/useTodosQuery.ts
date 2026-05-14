import { useQuery } from '@tanstack/react-query';
import { getTodos } from '../api/todos.api';
import { QUERY_KEYS } from '../constants';
import type { TodoFilters } from '../types/todo.types';

export function useTodosQuery(filters?: TodoFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.todos(filters),
    queryFn: () => getTodos(filters),
  });
}
