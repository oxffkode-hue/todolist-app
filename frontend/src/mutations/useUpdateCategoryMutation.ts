import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCategory } from '../api/categories.api';
import { QUERY_KEYS } from '../constants';
import type { UpdateCategoryRequest } from '../types/category.types';

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryRequest }) =>
      updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories() });
    },
  });
}
