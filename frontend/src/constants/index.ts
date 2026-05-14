import type { TodoFilters } from '../types/todo.types';

export const QUERY_KEYS = {
  todos: (filters?: TodoFilters) => ['todos', filters ?? {}] as const,
  todo: (id: string) => ['todos', id] as const,
  categories: () => ['categories'] as const,
} as const;

export const ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  HOME: '/',
  CATEGORIES: '/categories',
  PROFILE: '/profile',
} as const;
