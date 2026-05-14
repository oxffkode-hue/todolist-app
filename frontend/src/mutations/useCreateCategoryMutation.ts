import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCategory } from '../api/categories.api';
import { QUERY_KEYS } from '../constants';
import type { CreateCategoryRequest } from '../types/category.types';

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCategoryRequest) => createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories() });
    },
  });
}
