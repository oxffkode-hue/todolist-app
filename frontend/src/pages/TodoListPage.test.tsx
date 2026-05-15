import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import TodoListPage from './TodoListPage';
import * as todosApi from '../api/todos.api';
import * as categoriesApi from '../api/categories.api';
import { useUiStore } from '../stores/uiStore';
import type { Todo } from '../types/todo.types';
import type { Category } from '../types/category.types';

vi.mock('../api/todos.api');
vi.mock('../api/categories.api');

const mockTodos: Todo[] = [
  {
    id: 'todo-1',
    userId: 'user-1',
    categoryId: 'cat-1',
    title: '기획서 초안 작성',
    description: null,
    dueDate: '2026-05-15',
    isCompleted: false,
    createdAt: '2026-05-14T00:00:00.000Z',
    updatedAt: '2026-05-14T00:00:00.000Z',
  },
  {
    id: 'todo-2',
    userId: 'user-1',
    categoryId: 'cat-1',
    title: '장보기',
    description: null,
    dueDate: null,
    isCompleted: true,
    createdAt: '2026-05-14T00:00:00.000Z',
    updatedAt: '2026-05-14T00:00:00.000Z',
  },
];

const mockCategories: Category[] = [
  {
    id: 'cat-1',
    userId: null,
    name: '업무',
    icon: 'tag',
    isDefault: true,
    createdAt: '2026-05-14T00:00:00.000Z',
    updatedAt: '2026-05-14T00:00:00.000Z',
  },
];

function renderPage(initialPath = '/') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route index element={<TodoListPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('TodoListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUiStore.setState({ activeFilter: {}, isSidebarOpen: false });
    vi.mocked(categoriesApi.getCategories).mockResolvedValue(mockCategories);
  });

  it('로딩 중 상태 표시', () => {
    vi.mocked(todosApi.getTodos).mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('에러 상태 표시', async () => {
    vi.mocked(todosApi.getTodos).mockRejectedValue(new Error('Network Error'));
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('할일을 불러오지 못했습니다.')).toBeDefined();
    });
  });

  it('할일 목록 정상 렌더링', async () => {
    vi.mocked(todosApi.getTodos).mockResolvedValue(mockTodos);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('기획서 초안 작성')).toBeDefined();
      expect(screen.getByText('장보기')).toBeDefined();
    });
  });

  it('할일 통계 표시 (총 N개, 미완료 N개, 완료 N개)', async () => {
    vi.mocked(todosApi.getTodos).mockResolvedValue(mockTodos);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('총 2개 · 미완료 1개 · 완료 1개')).toBeDefined();
    });
  });

  it('할일 없을 때 빈 상태 표시', async () => {
    vi.mocked(todosApi.getTodos).mockResolvedValue([]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('할일이 없습니다.')).toBeDefined();
    });
  });

  it('URL의 categoryId 파라미터를 uiStore에 반영', async () => {
    vi.mocked(todosApi.getTodos).mockResolvedValue([]);
    renderPage('/?categoryId=cat-1');
    await waitFor(() => {
      expect(useUiStore.getState().activeFilter.categoryId).toBe('cat-1');
    });
  });

  it('필터 패널 렌더링', async () => {
    vi.mocked(todosApi.getTodos).mockResolvedValue([]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('필터')).toBeDefined();
    });
  });

  it('할일 목록 섹션 헤딩 표시', async () => {
    vi.mocked(todosApi.getTodos).mockResolvedValue([]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('할일 목록')).toBeDefined();
    });
  });
});
