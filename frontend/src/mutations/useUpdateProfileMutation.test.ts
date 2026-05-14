import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useUpdateProfileMutation } from './useUpdateProfileMutation';
import * as usersApi from '../api/users.api';
import type { User } from '../types/user.types';

const mockUpdateUser = vi.fn();

vi.mock('../api/users.api');
vi.mock('../stores/authStore', () => ({
  useAuthStore: (selector: (s: { updateUser: typeof mockUpdateUser }) => unknown) =>
    selector({ updateUser: mockUpdateUser }),
}));

const mockUser: User = {
  id: 'user-1',
  email: 'test@test.com',
  name: '홍길동',
  darkMode: false,
  language: 'ko',
  createdAt: '2026-05-14T00:00:00.000Z',
  updatedAt: '2026-05-14T00:00:00.000Z',
};

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
}

describe('useUpdateProfileMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updateProfile API를 호출한다', async () => {
    vi.mocked(usersApi.updateProfile).mockResolvedValue({ ...mockUser, name: '새이름' });
    const { result } = renderHook(() => useUpdateProfileMutation(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate({ name: '새이름' });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(usersApi.updateProfile).toHaveBeenCalledWith({ name: '새이름' });
  });

  it('성공 시 updateUser(authStore)를 호출한다', async () => {
    const updatedUser = { ...mockUser, name: '새이름' };
    vi.mocked(usersApi.updateProfile).mockResolvedValue(updatedUser);
    const { result } = renderHook(() => useUpdateProfileMutation(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate({ name: '새이름' });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockUpdateUser).toHaveBeenCalledWith(updatedUser);
  });

  it('실패 시 isError가 true다', async () => {
    vi.mocked(usersApi.updateProfile).mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useUpdateProfileMutation(), { wrapper: createWrapper() });
    await act(async () => {
      result.current.mutate({ name: '새이름' });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });
});
