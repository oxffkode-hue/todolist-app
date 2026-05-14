import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
  it('에러 메시지 텍스트를 렌더링한다', () => {
    render(<ErrorMessage message="오류가 발생했습니다." />);
    expect(screen.getByText('오류가 발생했습니다.')).toBeTruthy();
  });

  it('role="alert" 속성을 가진다', () => {
    render(<ErrorMessage message="에러" />);
    expect(screen.getByRole('alert')).toBeTruthy();
  });
});
