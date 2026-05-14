import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useCreateTodoMutation } from './useCreateTodoMutation';
import { useUpdateTodoMutation } from './useUpdateTodoMutation';
import { useDeleteTodoMutation } from './useDeleteTodoMutation';
import { useToggleTodoMutation } from './useToggleTodoMutation';
import * as todosApi from '../api/todos.api';
import type { Todo } from '../types/todo.types';

vi.mock('../api/todos.api');

const mockTodo: Todo = {
  id: 'todo-1',
  userId: 'user-1',
  categoryId: 'cat-1',
  title: '테스트',
  description: null,
  dueDate: null,
  isCompleted: false,
  createdAt: '2026-05-14T00:00:00.000Z',
  updatedAt: '2026-05-14T00:00:00.000Z',
};

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
}

describe('useCreateTodoMutation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('성공 시 createTodo 호출 및 todos 캐시 무효화', async () => {
    vi.mocked(todosApi.createTodo).mockResolvedValue({ ...mockTodo, title: '새 할일' });
    const { result } = renderHook(() => useCreateTodoMutation(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate({ title: '새 할일', categoryId: 'cat-1' });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(todosApi.createTodo).toHaveBeenCalledWith({ title: '새 할일', categoryId: 'cat-1' });
  });

  it('실패 시 isError true', async () => {
    vi.mocked(todosApi.createTodo).mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useCreateTodoMutation(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate({ title: '새 할일', categoryId: 'cat-1' });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useUpdateTodoMutation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('성공 시 updateTodo 호출', async () => {
    vi.mocked(todosApi.updateTodo).mockResolvedValue({ ...mockTodo, title: '수정됨' });
    const { result } = renderHook(() => useUpdateTodoMutation(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate({ id: 'todo-1', data: { title: '수정됨' } });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(todosApi.updateTodo).toHaveBeenCalledWith('todo-1', { title: '수정됨' });
  });
});

describe('useDeleteTodoMutation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('성공 시 deleteTodo 호출', async () => {
    vi.mocked(todosApi.deleteTodo).mockResolvedValue({ message: 'deleted' });
    const { result } = renderHook(() => useDeleteTodoMutation(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate('todo-1');
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(todosApi.deleteTodo).toHaveBeenCalledWith('todo-1');
  });
});

describe('useToggleTodoMutation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('성공 시 updateTodo에 isCompleted 전달', async () => {
    vi.mocked(todosApi.updateTodo).mockResolvedValue({ ...mockTodo, isCompleted: true });
    const { result } = renderHook(() => useToggleTodoMutation(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate({ id: 'todo-1', isCompleted: true });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(todosApi.updateTodo).toHaveBeenCalledWith('todo-1', { isCompleted: true });
  });

  it('완료→미완료 토글', async () => {
    vi.mocked(todosApi.updateTodo).mockResolvedValue({ ...mockTodo, isCompleted: false });
    const { result } = renderHook(() => useToggleTodoMutation(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate({ id: 'todo-1', isCompleted: false });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(todosApi.updateTodo).toHaveBeenCalledWith('todo-1', { isCompleted: false });
  });
});
