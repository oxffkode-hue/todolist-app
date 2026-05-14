import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useLogoutMutation } from './useLogoutMutation';
import * as authApi from '../api/auth.api';

const mockNavigate = vi.fn();
const mockClearAuth = vi.fn();

vi.mock('../api/auth.api');
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));
vi.mock('../stores/authStore', () => ({
  useAuthStore: (selector: (s: { clearAuth: typeof mockClearAuth }) => unknown) =>
    selector({ clearAuth: mockClearAuth }),
}));

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
}

describe('useLogoutMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logout API를 호출한다', async () => {
    vi.mocked(authApi.logout).mockResolvedValue({ message: 'logged out' });
    const { result } = renderHook(() => useLogoutMutation(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate();
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(authApi.logout).toHaveBeenCalledTimes(1);
  });

  it('성공 시 clearAuth를 호출한다', async () => {
    vi.mocked(authApi.logout).mockResolvedValue({ message: 'logged out' });
    const { result } = renderHook(() => useLogoutMutation(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate();
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockClearAuth).toHaveBeenCalledTimes(1);
  });

  it('성공 시 /login으로 navigate한다', async () => {
    vi.mocked(authApi.logout).mockResolvedValue({ message: 'logged out' });
    const { result } = renderHook(() => useLogoutMutation(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate();
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('실패 시에도 clearAuth + navigate를 호출한다', async () => {
    vi.mocked(authApi.logout).mockRejectedValue(new Error('network error'));
    const { result } = renderHook(() => useLogoutMutation(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate();
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockClearAuth).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
