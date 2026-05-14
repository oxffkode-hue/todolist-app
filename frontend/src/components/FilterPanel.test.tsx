import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FilterPanel from './FilterPanel';
import * as categoriesApi from '../api/categories.api';
import { useUiStore } from '../stores/uiStore';
import type { Category } from '../types/category.types';

vi.mock('../api/categories.api');

const mockCategories: Category[] = [
  {
    id: 'cat-1',
    userId: null,
    name: '업무',
    isDefault: true,
    createdAt: '2026-05-14T00:00:00.000Z',
    updatedAt: '2026-05-14T00:00:00.000Z',
  },
  {
    id: 'cat-2',
    userId: 'user-1',
    name: '스터디',
    isDefault: false,
    createdAt: '2026-05-14T00:00:00.000Z',
    updatedAt: '2026-05-14T00:00:00.000Z',
  },
];

function renderFilterPanel() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <FilterPanel />
    </QueryClientProvider>,
  );
}

describe('FilterPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUiStore.setState({ activeFilter: {}, isSidebarOpen: false });
    vi.mocked(categoriesApi.getCategories).mockResolvedValue(mockCategories);
  });

  it('카테고리 전체 옵션 렌더링', () => {
    renderFilterPanel();
    expect(screen.getByRole('combobox')).toBeDefined();
    expect(screen.getByRole('option', { name: '전체' })).toBeDefined();
  });

  it('완료 여부 라디오 버튼 렌더링', () => {
    renderFilterPanel();
    expect(screen.getByRole('radio', { name: '전체' })).toBeDefined();
    expect(screen.getByRole('radio', { name: '미완료' })).toBeDefined();
    expect(screen.getByRole('radio', { name: '완료' })).toBeDefined();
  });

  it('기간 date input 렌더링', () => {
    renderFilterPanel();
    const dateInputs = screen.getAllByDisplayValue('');
    expect(dateInputs.length).toBeGreaterThanOrEqual(2);
  });

  it('초기 상태에서 초기화 버튼 미표시', () => {
    renderFilterPanel();
    expect(screen.queryByRole('button', { name: '초기화' })).toBeNull();
  });

  it('필터 적용 후 초기화 버튼 표시', () => {
    useUiStore.setState({ activeFilter: { isCompleted: false }, isSidebarOpen: false });
    renderFilterPanel();
    expect(screen.getByRole('button', { name: '초기화' })).toBeDefined();
  });

  it('초기화 버튼 클릭 시 필터 초기화', () => {
    useUiStore.setState({ activeFilter: { isCompleted: true }, isSidebarOpen: false });
    renderFilterPanel();
    fireEvent.click(screen.getByRole('button', { name: '초기화' }));
    expect(useUiStore.getState().activeFilter).toEqual({});
  });

  it('미완료 라디오 선택 시 isCompleted=false 설정', () => {
    renderFilterPanel();
    fireEvent.click(screen.getByRole('radio', { name: '미완료' }));
    expect(useUiStore.getState().activeFilter.isCompleted).toBe(false);
  });

  it('완료 라디오 선택 시 isCompleted=true 설정', () => {
    renderFilterPanel();
    fireEvent.click(screen.getByRole('radio', { name: '완료' }));
    expect(useUiStore.getState().activeFilter.isCompleted).toBe(true);
  });

  it('전체 라디오 선택 시 isCompleted 제거', () => {
    useUiStore.setState({ activeFilter: { isCompleted: true }, isSidebarOpen: false });
    renderFilterPanel();
    fireEvent.click(screen.getByRole('radio', { name: '전체' }));
    expect(useUiStore.getState().activeFilter.isCompleted).toBeUndefined();
  });
});
