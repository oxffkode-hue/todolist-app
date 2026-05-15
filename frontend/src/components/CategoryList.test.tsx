import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CategoryList from './CategoryList';
import * as categoriesApi from '../api/categories.api';
import type { Category } from '../types/category.types';

vi.mock('../api/categories.api');

const defaultCat: Category = {
  id: 'default-1',
  userId: null,
  name: '업무',
  icon: 'tag',
  isDefault: true,
  createdAt: '2026-05-14T00:00:00.000Z',
  updatedAt: '2026-05-14T00:00:00.000Z',
};

const customCat: Category = {
  id: 'custom-1',
  userId: 'user-1',
  name: '마케팅',
  icon: 'folder',
  isDefault: false,
  createdAt: '2026-05-14T00:00:00.000Z',
  updatedAt: '2026-05-14T00:00:00.000Z',
};

function renderCategoryList(categories: Category[] = [defaultCat, customCat]) {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <CategoryList categories={categories} />
    </QueryClientProvider>,
  );
}

describe('CategoryList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('기본/사용자 카테고리 목록 렌더링', () => {
    renderCategoryList();
    expect(screen.getByText('업무')).toBeDefined();
    expect(screen.getByText('마케팅')).toBeDefined();
  });

  it('기본 카테고리 수정/삭제 버튼 비활성화', () => {
    renderCategoryList();
    const editBtns = screen.getAllByLabelText('업무 수정');
    const deleteBtns = screen.getAllByLabelText('업무 삭제');
    expect((editBtns[0] as HTMLButtonElement).disabled).toBe(true);
    expect((deleteBtns[0] as HTMLButtonElement).disabled).toBe(true);
  });

  it('사용자 정의 카테고리 수정/삭제 버튼 활성화', () => {
    renderCategoryList();
    expect((screen.getByLabelText('마케팅 수정') as HTMLButtonElement).disabled).toBe(false);
    expect((screen.getByLabelText('마케팅 삭제') as HTMLButtonElement).disabled).toBe(false);
  });

  it('카테고리 추가 버튼 클릭 시 폼 표시', () => {
    renderCategoryList();
    fireEvent.click(screen.getByRole('button', { name: '+ 카테고리 추가' }));
    expect(screen.getByPlaceholderText('카테고리명 입력')).toBeDefined();
  });

  it('카테고리 생성 성공 시 폼 닫힘', async () => {
    vi.mocked(categoriesApi.createCategory).mockResolvedValue({
      ...customCat,
      id: 'new-1',
      name: '스터디',
    });
    renderCategoryList();
    fireEvent.click(screen.getByRole('button', { name: '+ 카테고리 추가' }));
    fireEvent.change(screen.getByPlaceholderText('카테고리명 입력'), {
      target: { value: '스터디' },
    });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('카테고리명 입력')).toBeNull();
    });
  });

  it('중복 카테고리명 에러 메시지 표시', async () => {
    const err = Object.assign(new Error('Conflict'), {
      isAxiosError: true,
      response: { status: 409, data: { code: 'CATEGORY_NAME_DUPLICATE' } },
    });
    vi.mocked(categoriesApi.createCategory).mockRejectedValue(err);
    renderCategoryList();
    fireEvent.click(screen.getByRole('button', { name: '+ 카테고리 추가' }));
    fireEvent.change(screen.getByPlaceholderText('카테고리명 입력'), {
      target: { value: '업무' },
    });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    await waitFor(() => {
      expect(screen.getByText('이미 사용 중인 카테고리 이름입니다.')).toBeDefined();
    });
  });

  it('할일 있는 카테고리 삭제 시 에러 메시지 표시', async () => {
    const err = Object.assign(new Error('Bad Request'), {
      isAxiosError: true,
      response: { status: 400, data: { code: 'CATEGORY_HAS_TODOS' } },
    });
    vi.mocked(categoriesApi.deleteCategory).mockRejectedValue(err);
    renderCategoryList();
    fireEvent.click(screen.getByLabelText('마케팅 삭제'));
    await waitFor(() => {
      expect(screen.getByText('할일이 존재하는 카테고리는 삭제할 수 없습니다.')).toBeDefined();
    });
  });

  it('사용자 정의 카테고리 없을 때 안내 메시지 표시', () => {
    renderCategoryList([defaultCat]);
    expect(screen.getByText('사용자 정의 카테고리가 없습니다.')).toBeDefined();
  });
});
