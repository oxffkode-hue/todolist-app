import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProfilePage from './ProfilePage';
import * as usersApi from '../api/users.api';
import * as authApi from '../api/auth.api';
import type { User } from '../types/user.types';

const mockNavigate = vi.fn();
const mockClearAuth = vi.fn();
const mockUpdateUser = vi.fn();

const mockUser: User = {
  id: 'user-1',
  email: 'test@test.com',
  name: '홍길동',
  darkMode: false,
  language: 'ko',
  createdAt: '2026-05-14T00:00:00.000Z',
  updatedAt: '2026-05-14T00:00:00.000Z',
};

vi.mock('../api/users.api');
vi.mock('../api/auth.api');
vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router-dom')>();
  return { ...mod, useNavigate: () => mockNavigate };
});
vi.mock('../stores/authStore', () => ({
  useAuthStore: (
    selector: (s: {
      user: User;
      clearAuth: typeof mockClearAuth;
      updateUser: typeof mockUpdateUser;
    }) => unknown,
  ) => selector({ user: mockUser, clearAuth: mockClearAuth, updateUser: mockUpdateUser }),
}));

function renderProfilePage() {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('이름 변경 섹션', () => {
    it('현재 이름 초기값이 표시된다', () => {
      renderProfilePage();
      const nameInput = screen.getByDisplayValue('홍길동');
      expect(nameInput).toBeDefined();
    });

    it('이름 변경 성공 시 성공 메시지를 표시한다', async () => {
      vi.mocked(usersApi.updateProfile).mockResolvedValue({ ...mockUser, name: '새이름' });
      renderProfilePage();
      const nameInput = screen.getByDisplayValue('홍길동');
      fireEvent.change(nameInput, { target: { value: '새이름' } });
      fireEvent.click(screen.getByRole('button', { name: '이름 변경' }));
      await waitFor(() => {
        expect(screen.getByText('이름이 변경되었습니다.')).toBeDefined();
      });
    });

    it('이름 변경 실패 시 에러 메시지를 표시한다', async () => {
      vi.mocked(usersApi.updateProfile).mockRejectedValue(new Error('fail'));
      renderProfilePage();
      const nameInput = screen.getByDisplayValue('홍길동');
      fireEvent.change(nameInput, { target: { value: '새이름' } });
      fireEvent.click(screen.getByRole('button', { name: '이름 변경' }));
      await waitFor(() => {
        expect(screen.getByText('이름 변경에 실패했습니다.')).toBeDefined();
      });
    });
  });

  describe('비밀번호 변경 섹션', () => {
    it('새 비밀번호 형식 불량 시 클라이언트 에러를 표시한다', async () => {
      renderProfilePage();
      fireEvent.change(screen.getByLabelText('현재 비밀번호'), { target: { value: 'current1' } });
      fireEvent.change(screen.getByLabelText('새 비밀번호'), { target: { value: 'short' } });
      fireEvent.change(screen.getByLabelText('새 비밀번호 확인'), { target: { value: 'short' } });
      fireEvent.click(screen.getByRole('button', { name: '비밀번호 변경' }));
      await waitFor(() => {
        expect(screen.getByText('비밀번호는 8자 이상이어야 합니다.')).toBeDefined();
      });
    });

    it('비밀번호 확인 불일치 시 에러를 표시한다', async () => {
      renderProfilePage();
      fireEvent.change(screen.getByLabelText('현재 비밀번호'), { target: { value: 'current1' } });
      fireEvent.change(screen.getByLabelText('새 비밀번호'), { target: { value: 'newpass1' } });
      fireEvent.change(screen.getByLabelText('새 비밀번호 확인'), {
        target: { value: 'different1' },
      });
      fireEvent.click(screen.getByRole('button', { name: '비밀번호 변경' }));
      await waitFor(() => {
        expect(screen.getByText('비밀번호가 일치하지 않습니다.')).toBeDefined();
      });
    });

    it('현재 비밀번호 불일치(401) 시 에러 메시지를 표시한다', async () => {
      const err = Object.assign(new Error('Unauthorized'), {
        isAxiosError: true,
        response: { status: 401, data: {} },
      });
      vi.mocked(usersApi.updateProfile).mockRejectedValue(err);
      renderProfilePage();
      fireEvent.change(screen.getByLabelText('현재 비밀번호'), {
        target: { value: 'wrongpass1' },
      });
      fireEvent.change(screen.getByLabelText('새 비밀번호'), { target: { value: 'newpass1' } });
      fireEvent.change(screen.getByLabelText('새 비밀번호 확인'), { target: { value: 'newpass1' } });
      fireEvent.click(screen.getByRole('button', { name: '비밀번호 변경' }));
      await waitFor(() => {
        expect(screen.getByText('현재 비밀번호가 올바르지 않습니다.')).toBeDefined();
      });
    });
  });

  describe('회원 탈퇴 섹션', () => {
    it('회원 탈퇴 버튼 클릭 시 확인 모달이 표시된다', () => {
      renderProfilePage();
      fireEvent.click(screen.getByRole('button', { name: '회원 탈퇴' }));
      expect(screen.getByText('탈퇴 시 모든 데이터가 영구 삭제됩니다.')).toBeDefined();
    });

    it('탈퇴 모달 취소 시 모달이 닫힌다', () => {
      renderProfilePage();
      fireEvent.click(screen.getByRole('button', { name: '회원 탈퇴' }));
      expect(screen.getByText('탈퇴 시 모든 데이터가 영구 삭제됩니다.')).toBeDefined();
      fireEvent.click(screen.getByRole('button', { name: '취소' }));
      expect(screen.queryByText('탈퇴 시 모든 데이터가 영구 삭제됩니다.')).toBeNull();
    });

    it('탈퇴하기 버튼 클릭 시 deleteAccount API를 호출한다', async () => {
      vi.mocked(authApi.deleteAccount).mockResolvedValue({ message: 'deleted' });
      renderProfilePage();
      fireEvent.click(screen.getByRole('button', { name: '회원 탈퇴' }));
      const passwordInput = screen.getByLabelText('비밀번호');
      fireEvent.change(passwordInput, { target: { value: 'mypass1' } });
      fireEvent.click(screen.getByRole('button', { name: '탈퇴하기' }));
      await waitFor(() => {
        expect(authApi.deleteAccount).toHaveBeenCalledWith({ password: 'mypass1' });
      });
    });
  });
});
