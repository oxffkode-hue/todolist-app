import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useDeleteAccountMutation } from './useDeleteAccountMutation';
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

describe('useDeleteAccountMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deleteAccount API를 호출한다', async () => {
    vi.mocked(authApi.deleteAccount).mockResolvedValue({ message: 'deleted' });
    const { result } = renderHook(() => useDeleteAccountMutation(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate({ password: 'pass1234' });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(authApi.deleteAccount).toHaveBeenCalledWith({ password: 'pass1234' });
  });

  it('성공 시 clearAuth를 호출한다', async () => {
    vi.mocked(authApi.deleteAccount).mockResolvedValue({ message: 'deleted' });
    const { result } = renderHook(() => useDeleteAccountMutation(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate({ password: 'pass1234' });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockClearAuth).toHaveBeenCalledTimes(1);
  });

  it('성공 시 /login으로 navigate한다', async () => {
    vi.mocked(authApi.deleteAccount).mockResolvedValue({ message: 'deleted' });
    const { result } = renderHook(() => useDeleteAccountMutation(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate({ password: 'pass1234' });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
