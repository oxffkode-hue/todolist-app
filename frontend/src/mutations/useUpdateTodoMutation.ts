import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTodo } from '../api/todos.api';
import type { UpdateTodoRequest } from '../types/todo.types';

interface Payload {
  id: string;
  data: UpdateTodoRequest;
}

export function useUpdateTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: Payload) => updateTodo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
