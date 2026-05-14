import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../api/categories.api';
import { QUERY_KEYS } from '../constants';

export function useCategoriesQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.categories(),
    queryFn: getCategories,
  });
}
