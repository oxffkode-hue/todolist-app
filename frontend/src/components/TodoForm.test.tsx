import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TodoForm from './TodoForm';
import type { Category } from '../types/category.types';
import type { Todo } from '../types/todo.types';

const categories: Category[] = [
  {
    id: 'cat-1',
    userId: null,
    name: '업무',
    icon: 'tag',
    isDefault: true,
    createdAt: '2026-05-14T00:00:00.000Z',
    updatedAt: '2026-05-14T00:00:00.000Z',
  },
  {
    id: 'cat-2',
    userId: 'user-1',
    name: '스터디',
    icon: 'folder',
    isDefault: false,
    createdAt: '2026-05-14T00:00:00.000Z',
    updatedAt: '2026-05-14T00:00:00.000Z',
  },
];

const baseTodo: Todo = {
  id: 'todo-1',
  userId: 'user-1',
  categoryId: 'cat-1',
  title: '기존 제목',
  description: '기존 설명',
  dueDate: '2026-05-20',
  isCompleted: false,
  createdAt: '2026-05-14T00:00:00.000Z',
  updatedAt: '2026-05-14T00:00:00.000Z',
};

describe('TodoForm', () => {
  it('등록 모드: 초기 상태에서 버튼 활성화 (제출 시 검증)', () => {
    render(<TodoForm categories={categories} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    const btn = screen.getByRole('button', { name: '저장' }) as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });

  it('제목+카테고리 입력 시 버튼 활성화', () => {
    render(<TodoForm categories={categories} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('할일 제목을 입력하세요'), { target: { value: '새 할일' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'cat-1' } });
    const btn = screen.getByRole('button', { name: '저장' }) as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });

  it('제목 미입력 제출 시 에러 메시지 표시', () => {
    const onSubmit = vi.fn();
    render(<TodoForm categories={categories} onSubmit={onSubmit} onCancel={vi.fn()} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'cat-1' } });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    expect(screen.getByText('제목을 입력해주세요.')).toBeDefined();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('카테고리 미선택 제출 시 에러 메시지 표시', () => {
    const onSubmit = vi.fn();
    render(<TodoForm categories={categories} onSubmit={onSubmit} onCancel={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('할일 제목을 입력하세요'), { target: { value: '새 할일' } });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    expect(screen.getByText('카테고리를 선택해주세요.')).toBeDefined();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('유효한 입력 제출 시 onSubmit 호출', () => {
    const onSubmit = vi.fn();
    render(<TodoForm categories={categories} onSubmit={onSubmit} onCancel={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('할일 제목을 입력하세요'), { target: { value: '새 할일' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'cat-1' } });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ title: '새 할일', categoryId: 'cat-1' }));
  });

  it('취소 버튼 클릭 시 onCancel 호출', () => {
    const onCancel = vi.fn();
    render(<TodoForm categories={categories} onSubmit={vi.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('수정 모드: 기존 데이터 초기값 표시', () => {
    render(<TodoForm initialData={baseTodo} categories={categories} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect((screen.getByPlaceholderText('할일 제목을 입력하세요') as HTMLInputElement).value).toBe('기존 제목');
    expect(screen.getByRole('button', { name: '수정' })).toBeDefined();
  });

  it('수정 모드: 카테고리 초기값 선택됨', () => {
    render(<TodoForm initialData={baseTodo} categories={categories} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('cat-1');
  });

  it('외부 error prop 표시', () => {
    render(<TodoForm categories={categories} onSubmit={vi.fn()} onCancel={vi.fn()} error="서버 오류가 발생했습니다." />);
    expect(screen.getByText('서버 오류가 발생했습니다.')).toBeDefined();
  });

  it('카테고리 목록 옵션 렌더링', () => {
    render(<TodoForm categories={categories} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('option', { name: /업무/ })).toBeDefined();
    expect(screen.getByRole('option', { name: /스터디/ })).toBeDefined();
  });
});
