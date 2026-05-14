import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTodo } from '../api/todos.api';
import type { CreateTodoRequest } from '../types/todo.types';

export function useCreateTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTodoRequest) => createTodo(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
