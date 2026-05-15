import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TodoList from './TodoList';
import type { Todo } from '../types/todo.types';
import type { Category } from '../types/category.types';

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

const todo1: Todo = {
  id: 'todo-1',
  userId: 'user-1',
  categoryId: 'cat-1',
  title: '기획서 초안 작성',
  description: null,
  dueDate: '2026-05-15',
  isCompleted: false,
  createdAt: '2026-05-14T00:00:00.000Z',
  updatedAt: '2026-05-14T00:00:00.000Z',
};

const todo2: Todo = {
  id: 'todo-2',
  userId: 'user-1',
  categoryId: 'cat-2',
  title: 'React 강의 듣기',
  description: null,
  dueDate: null,
  isCompleted: true,
  createdAt: '2026-05-14T00:00:00.000Z',
  updatedAt: '2026-05-14T00:00:00.000Z',
};

describe('TodoList', () => {
  it('할일 목록 렌더링', () => {
    render(<TodoList todos={[todo1, todo2]} categories={categories} />);
    expect(screen.getByText('기획서 초안 작성')).toBeDefined();
    expect(screen.getByText('React 강의 듣기')).toBeDefined();
  });

  it('카테고리명 표시', () => {
    render(<TodoList todos={[todo1]} categories={categories} />);
    expect(screen.getByText('업무')).toBeDefined();
  });

  it('카테고리를 찾지 못하면 "알 수 없음" 표시', () => {
    const todoWithUnknownCat: Todo = { ...todo1, categoryId: 'unknown' };
    render(<TodoList todos={[todoWithUnknownCat]} categories={categories} />);
    expect(screen.getByText('알 수 없음')).toBeDefined();
  });

  it('빈 목록 — 필터 없을 때 기본 메시지', () => {
    render(<TodoList todos={[]} categories={categories} />);
    expect(screen.getByText('할일이 없습니다.')).toBeDefined();
  });

  it('빈 목록 — 필터 있을 때 조건 메시지', () => {
    render(<TodoList todos={[]} categories={categories} isFiltered />);
    expect(screen.getByText('조건에 맞는 할일이 없습니다.')).toBeDefined();
    expect(screen.getByText('필터를 변경하거나 새 할일을 추가해 보세요.')).toBeDefined();
  });

  it('필터 없을 때 hint 미표시', () => {
    render(<TodoList todos={[]} categories={categories} />);
    expect(screen.queryByText('필터를 변경하거나 새 할일을 추가해 보세요.')).toBeNull();
  });
});
