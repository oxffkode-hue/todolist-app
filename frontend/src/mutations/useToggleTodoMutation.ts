import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTodo } from '../api/todos.api';

interface Payload {
  id: string;
  isCompleted: boolean;
}

export function useToggleTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isCompleted }: Payload) => updateTodo(id, { isCompleted }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
