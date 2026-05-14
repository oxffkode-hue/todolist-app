import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TodoDetail from './TodoDetail';
import * as todosApi from '../api/todos.api';
import type { Category } from '../types/category.types';
import type { Todo } from '../types/todo.types';

vi.mock('../api/todos.api');

const categories: Category[] = [
  {
    id: 'cat-1',
    userId: null,
    name: '업무',
    isDefault: true,
    createdAt: '2026-05-14T00:00:00.000Z',
    updatedAt: '2026-05-14T00:00:00.000Z',
  },
];

const baseTodo: Todo = {
  id: 'todo-1',
  userId: 'user-1',
  categoryId: 'cat-1',
  title: '기존 할일',
  description: null,
  dueDate: null,
  isCompleted: false,
  createdAt: '2026-05-14T00:00:00.000Z',
  updatedAt: '2026-05-14T00:00:00.000Z',
};

function renderDetail(props: Partial<Parameters<typeof TodoDetail>[0]> = {}) {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <TodoDetail isOpen={true} categories={categories} onClose={vi.fn()} {...props} />
    </QueryClientProvider>,
  );
}

describe('TodoDetail', () => {
  beforeEach(() => vi.clearAllMocks());

  it('isOpen=false 이면 렌더링 안 함', () => {
    renderDetail({ isOpen: false });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('등록 모드 타이틀 표시', () => {
    renderDetail();
    expect(screen.getByText('새 할일 추가')).toBeDefined();
  });

  it('수정 모드 타이틀 표시', () => {
    renderDetail({ todo: baseTodo });
    expect(screen.getByText('할일 수정')).toBeDefined();
  });

  it('닫기 버튼 클릭 시 onClose 호출', () => {
    const onClose = vi.fn();
    renderDetail({ onClose });
    fireEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('오버레이 클릭 시 onClose 호출', () => {
    const onClose = vi.fn();
    renderDetail({ onClose });
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalled();
  });

  it('등록 성공 시 onClose 호출', async () => {
    vi.mocked(todosApi.createTodo).mockResolvedValue({
      ...baseTodo,
      id: 'new-1',
      title: '새 할일',
    });
    const onClose = vi.fn();
    renderDetail({ onClose });
    fireEvent.change(screen.getByPlaceholderText('할일 제목을 입력하세요'), { target: { value: '새 할일' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'cat-1' } });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('수정 성공 시 onClose 호출', async () => {
    vi.mocked(todosApi.updateTodo).mockResolvedValue({ ...baseTodo, title: '수정됨' });
    const onClose = vi.fn();
    renderDetail({ todo: baseTodo, onClose });
    fireEvent.change(screen.getByPlaceholderText('할일 제목을 입력하세요'), { target: { value: '수정됨' } });
    fireEvent.click(screen.getByRole('button', { name: '수정' }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});
