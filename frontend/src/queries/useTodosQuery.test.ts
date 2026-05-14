import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useTodosQuery } from './useTodosQuery';
import * as todosApi from '../api/todos.api';
import type { Todo } from '../types/todo.types';

vi.mock('../api/todos.api');

const mockTodo: Todo = {
  id: 'todo-1',
  userId: 'user-1',
  categoryId: 'cat-1',
  title: '테스트 할일',
  description: null,
  dueDate: '2026-05-20',
  isCompleted: false,
  createdAt: '2026-05-14T00:00:00.000Z',
  updatedAt: '2026-05-14T00:00:00.000Z',
};

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
}

describe('useTodosQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('필터 없이 getTodos 호출', async () => {
    vi.mocked(todosApi.getTodos).mockResolvedValue([mockTodo]);
    const { result } = renderHook(() => useTodosQuery(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(todosApi.getTodos).toHaveBeenCalledWith(undefined);
    expect(result.current.data).toEqual([mockTodo]);
  });

  it('필터와 함께 getTodos 호출', async () => {
    vi.mocked(todosApi.getTodos).mockResolvedValue([]);
    const filters = { categoryId: 'cat-1', isCompleted: false };
    const { result } = renderHook(() => useTodosQuery(filters), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(todosApi.getTodos).toHaveBeenCalledWith(filters);
  });

  it('API 에러 시 isError true', async () => {
    vi.mocked(todosApi.getTodos).mockRejectedValue(new Error('Network Error'));
    const { result } = renderHook(() => useTodosQuery(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
