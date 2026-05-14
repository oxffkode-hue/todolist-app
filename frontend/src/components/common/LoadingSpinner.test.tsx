import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('기본 렌더링을 확인한다', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('role="status"와 aria-label이 있는 요소를 렌더링한다', () => {
    render(<LoadingSpinner />);
    const el = screen.getByRole('status');
    expect(el.getAttribute('aria-label')).toBe('로딩 중');
  });
});
