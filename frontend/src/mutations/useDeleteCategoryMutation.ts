import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCategory } from '../api/categories.api';
import { QUERY_KEYS } from '../constants';

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories() });
    },
  });
}
