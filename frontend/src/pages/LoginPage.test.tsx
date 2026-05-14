import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './LoginPage';
import * as authApi from '../api/auth.api';

vi.mock('../api/auth.api');
vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router-dom')>();
  return { ...mod, useNavigate: () => vi.fn() };
});

function renderLoginPage() {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('이메일/비밀번호 입력 전 버튼 비활성화', () => {
    renderLoginPage();
    const btn = screen.getByRole('button', { name: '로그인' });
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });

  it('이메일/비밀번호 입력 후 버튼 활성화', () => {
    renderLoginPage();
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'pass1234' } });
    expect((screen.getByRole('button', { name: '로그인' }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('로그인 실패 시 에러 메시지 표시', async () => {
    const err = Object.assign(new Error('Unauthorized'), {
      isAxiosError: true,
      response: { status: 401, data: {} },
    });
    vi.mocked(authApi.login).mockRejectedValue(err);
    renderLoginPage();
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'wrong123' } });
    fireEvent.submit(screen.getByRole('button', { name: '로그인' }).closest('form')!);
    await waitFor(() => {
      expect(screen.getByText('이메일 또는 비밀번호가 올바르지 않습니다.')).toBeDefined();
    });
  });

  it('회원가입 링크가 존재한다', () => {
    renderLoginPage();
    expect(screen.getByRole('link', { name: '회원가입' })).toBeDefined();
  });
});
