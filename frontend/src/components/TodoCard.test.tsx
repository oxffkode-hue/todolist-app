import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TodoCard from './TodoCard';
import type { Todo } from '../types/todo.types';

const baseTodo: Todo = {
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

describe('TodoCard', () => {
  it('제목 렌더링', () => {
    render(<TodoCard todo={baseTodo} categoryName="업무" />);
    expect(screen.getByText('기획서 초안 작성')).toBeDefined();
  });

  it('카테고리 이름 렌더링', () => {
    render(<TodoCard todo={baseTodo} categoryName="업무" />);
    expect(screen.getByText('업무')).toBeDefined();
  });

  it('dueDate 렌더링', () => {
    render(<TodoCard todo={baseTodo} categoryName="업무" />);
    expect(screen.getByText('📅 2026-05-15')).toBeDefined();
  });

  it('dueDate 없을 때 "기간 없음" 표시', () => {
    render(<TodoCard todo={{ ...baseTodo, dueDate: null }} categoryName="업무" />);
    expect(screen.getByText('기간 없음')).toBeDefined();
  });

  it('미완료 체크박스 aria-pressed=false', () => {
    render(<TodoCard todo={baseTodo} categoryName="업무" />);
    const checkbox = screen.getByRole('button', { name: '완료로 변경' });
    expect(checkbox.getAttribute('aria-pressed')).toBe('false');
  });

  it('완료 체크박스 aria-pressed=true', () => {
    render(<TodoCard todo={{ ...baseTodo, isCompleted: true }} categoryName="업무" />);
    const checkbox = screen.getByRole('button', { name: '미완료로 변경' });
    expect(checkbox.getAttribute('aria-pressed')).toBe('true');
  });

  it('체크박스 클릭 시 onToggle 호출', () => {
    const onToggle = vi.fn();
    render(<TodoCard todo={baseTodo} categoryName="업무" onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button', { name: '완료로 변경' }));
    expect(onToggle).toHaveBeenCalledWith('todo-1', true);
  });

  it('수정 버튼 클릭 시 onEdit 호출', () => {
    const onEdit = vi.fn();
    render(<TodoCard todo={baseTodo} categoryName="업무" onEdit={onEdit} />);
    fireEvent.click(screen.getByRole('button', { name: '수정' }));
    expect(onEdit).toHaveBeenCalledWith(baseTodo);
  });

  it('삭제 버튼 클릭 시 onDelete 호출', () => {
    const onDelete = vi.fn();
    render(<TodoCard todo={baseTodo} categoryName="업무" onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: '삭제' }));
    expect(onDelete).toHaveBeenCalledWith('todo-1');
  });

  it('onEdit/onDelete 미전달 시 버튼 미렌더링', () => {
    render(<TodoCard todo={baseTodo} categoryName="업무" />);
    expect(screen.queryByRole('button', { name: '수정' })).toBeNull();
    expect(screen.queryByRole('button', { name: '삭제' })).toBeNull();
  });
});
