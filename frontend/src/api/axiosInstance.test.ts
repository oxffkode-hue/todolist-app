import { describe, it, expect, beforeEach, vi } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import axiosInstance from './axiosInstance';
import { useAuthStore } from '../stores/authStore';
import type { User } from '../types/user.types';

const mockUser: User = {
  id: 'user-1',
  email: 'a@b.com',
  name: 'Tester',
  darkMode: false,
  language: 'ko',
  createdAt: '2026-05-14T00:00:00.000Z',
  updatedAt: '2026-05-14T00:00:00.000Z',
};

describe('axiosInstance', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance);
    useAuthStore.getState().clearAuth();
    Object.defineProperty(window, 'location', {
      value: { href: '/', pathname: '/' },
      writable: true,
    });
  });

  it('토큰이 없을 때 Authorization 헤더를 추가하지 않는다', async () => {
    mock.onGet('/test').reply((config) => {
      expect(config.headers?.Authorization).toBeUndefined();
      return [200, { status: 'success', data: {} }];
    });
    await axiosInstance.get('/test');
  });

  it('토큰이 있을 때 Authorization 헤더를 자동 주입한다', async () => {
    useAuthStore.getState().setAuth('tk-123', mockUser);
    mock.onGet('/test').reply((config) => {
      expect(config.headers?.Authorization).toBe('Bearer tk-123');
      return [200, { status: 'success', data: {} }];
    });
    await axiosInstance.get('/test');
  });

  it('401 TOKEN_INVALID 응답 시 clearAuth + /login 리다이렉트', async () => {
    useAuthStore.getState().setAuth('tk-bad', mockUser);
    mock.onGet('/test').reply(401, { status: 'error', code: 'TOKEN_INVALID', message: '만료' });

    await expect(axiosInstance.get('/test')).rejects.toBeDefined();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(window.location.href).toBe('/login');
  });

  it('401 PASSWORD_MISMATCH 응답 시 리다이렉트하지 않는다', async () => {
    useAuthStore.getState().setAuth('tk-ok', mockUser);
    mock
      .onDelete('/auth/account')
      .reply(401, { status: 'error', code: 'PASSWORD_MISMATCH', message: '불일치' });

    await expect(axiosInstance.delete('/auth/account')).rejects.toBeDefined();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(window.location.href).toBe('/');
  });

  it('이미 /login 페이지면 리다이렉트하지 않는다', async () => {
    Object.defineProperty(window, 'location', {
      value: { href: '/login', pathname: '/login' },
      writable: true,
    });
    mock.onPost('/auth/login').reply(401, { status: 'error', message: '실패' });
    await expect(axiosInstance.post('/auth/login')).rejects.toBeDefined();
    expect(window.location.href).toBe('/login');
  });

  it('500 에러는 인증 상태에 영향이 없다', async () => {
    useAuthStore.getState().setAuth('tk', mockUser);
    mock.onGet('/test').reply(500, { status: 'error', code: 'INTERNAL_SERVER_ERROR' });
    await expect(axiosInstance.get('/test')).rejects.toBeDefined();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });
});

// silence happy-dom navigation warnings
vi.spyOn(console, 'error').mockImplementation(() => {});
