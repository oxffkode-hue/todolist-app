import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SignupPage from './SignupPage';
import * as authApi from '../api/auth.api';

vi.mock('../api/auth.api');
vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router-dom')>();
  return { ...mod, useNavigate: () => vi.fn() };
});

function renderSignupPage() {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function fillForm(overrides: Record<string, string> = {}) {
  const vals = {
    name: '홍길동',
    email: 'a@b.com',
    password: 'pass1234',
    passwordConfirm: 'pass1234',
    ...overrides,
  };
  fireEvent.change(screen.getByLabelText('이름'), { target: { value: vals.name } });
  fireEvent.change(screen.getByLabelText('이메일'), { target: { value: vals.email } });
  fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: vals.password } });
  fireEvent.change(screen.getByLabelText('비밀번호 확인'), { target: { value: vals.passwordConfirm } });
}

describe('SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('비밀번호 형식 불량 시 클라이언트 에러 즉시 표시', async () => {
    renderSignupPage();
    fillForm({ password: 'abc', passwordConfirm: 'abc' });
    fireEvent.submit(screen.getByRole('button', { name: '회원가입' }).closest('form')!);
    await waitFor(() => {
      expect(screen.getByText(/8자 이상/)).toBeDefined();
    });
  });

  it('비밀번호 불일치 시 에러 표시', async () => {
    renderSignupPage();
    fillForm({ passwordConfirm: 'different1' });
    fireEvent.submit(screen.getByRole('button', { name: '회원가입' }).closest('form')!);
    await waitFor(() => {
      expect(screen.getByText('비밀번호가 일치하지 않습니다.')).toBeDefined();
    });
  });

  it('중복 이메일 시 서버 에러 메시지 표시', async () => {
    const err = Object.assign(new Error('Conflict'), {
      isAxiosError: true,
      response: { status: 409, data: { code: 'EMAIL_CONFLICT' } },
    });
    vi.mocked(authApi.signup).mockRejectedValue(err);
    renderSignupPage();
    fillForm();
    fireEvent.submit(screen.getByRole('button', { name: '회원가입' }).closest('form')!);
    await waitFor(() => {
      expect(screen.getByText('이미 사용 중인 이메일입니다.')).toBeDefined();
    });
  });

  it('로그인 링크가 존재한다', () => {
    renderSignupPage();
    expect(screen.getByRole('link', { name: '로그인' })).toBeDefined();
  });

  it('모든 필드 비어있으면 버튼 비활성화', () => {
    renderSignupPage();
    const btn = screen.getByRole('button', { name: '회원가입' }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});
