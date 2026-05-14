import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuthStore } from '../stores/authStore';
import type { User } from '../types/user.types';

const mockUser: User = {
  id: 'u-1',
  email: 'a@b.com',
  name: '홍길동',
  darkMode: false,
  language: 'ko',
  createdAt: '2026-05-14T00:00:00.000Z',
  updatedAt: '2026-05-14T00:00:00.000Z',
};

function renderWithRouter(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>LoginPage</div>} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div>ProtectedContent</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  it('비인증 상태에서 / 접근 시 /login으로 리다이렉트', () => {
    renderWithRouter('/');
    expect(screen.getByText('LoginPage')).toBeDefined();
    expect(screen.queryByText('ProtectedContent')).toBeNull();
  });

  it('인증 상태에서 / 접근 시 보호된 콘텐츠 렌더링', () => {
    useAuthStore.getState().setAuth('tk', mockUser);
    renderWithRouter('/');
    expect(screen.getByText('ProtectedContent')).toBeDefined();
    expect(screen.queryByText('LoginPage')).toBeNull();
  });
});
