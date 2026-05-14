import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';
import { useUiStore } from './uiStore';
import type { User } from '../types/user.types';

const mockUser: User = {
  id: 'u-1',
  email: 'test@test.com',
  name: '홍길동',
  darkMode: false,
  language: 'ko',
  createdAt: '2026-05-14T00:00:00.000Z',
  updatedAt: '2026-05-14T00:00:00.000Z',
};

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  it('초기값: accessToken null, isAuthenticated false', () => {
    const { accessToken, user, isAuthenticated } = useAuthStore.getState();
    expect(accessToken).toBeNull();
    expect(user).toBeNull();
    expect(isAuthenticated).toBe(false);
  });

  it('setAuth 호출 후 isAuthenticated가 true', () => {
    useAuthStore.getState().setAuth('tk-abc', mockUser);
    const { accessToken, user, isAuthenticated } = useAuthStore.getState();
    expect(accessToken).toBe('tk-abc');
    expect(user).toEqual(mockUser);
    expect(isAuthenticated).toBe(true);
  });

  it('clearAuth 호출 후 accessToken, user 모두 null', () => {
    useAuthStore.getState().setAuth('tk-abc', mockUser);
    useAuthStore.getState().clearAuth();
    const { accessToken, user, isAuthenticated } = useAuthStore.getState();
    expect(accessToken).toBeNull();
    expect(user).toBeNull();
    expect(isAuthenticated).toBe(false);
  });

  it('updateUser: user가 있을 때 부분 업데이트', () => {
    useAuthStore.getState().setAuth('tk', mockUser);
    useAuthStore.getState().updateUser({ name: '김길동' });
    expect(useAuthStore.getState().user?.name).toBe('김길동');
    expect(useAuthStore.getState().user?.email).toBe('test@test.com');
  });

  it('updateUser: user가 null이면 null 유지', () => {
    useAuthStore.getState().updateUser({ name: '김길동' });
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('localStorage에 저장되지 않는다 (persist 미사용)', () => {
    useAuthStore.getState().setAuth('tk', mockUser);
    expect(localStorage.getItem('accessToken')).toBeNull();
  });
});

describe('uiStore', () => {
  beforeEach(() => {
    useUiStore.getState().resetFilter();
    useUiStore.getState().setSidebarOpen(false);
  });

  it('초기값: isSidebarOpen false, activeFilter 빈 객체', () => {
    const { isSidebarOpen, activeFilter } = useUiStore.getState();
    expect(isSidebarOpen).toBe(false);
    expect(activeFilter).toEqual({});
  });

  it('toggleSidebar: false → true', () => {
    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().isSidebarOpen).toBe(true);
  });

  it('toggleSidebar: true → false', () => {
    useUiStore.getState().setSidebarOpen(true);
    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().isSidebarOpen).toBe(false);
  });

  it('setFilter: 필터 적용', () => {
    useUiStore.getState().setFilter({ isCompleted: false, categoryId: 'cat-1' });
    const { activeFilter } = useUiStore.getState();
    expect(activeFilter.isCompleted).toBe(false);
    expect(activeFilter.categoryId).toBe('cat-1');
  });

  it('resetFilter: 초기화', () => {
    useUiStore.getState().setFilter({ isCompleted: true, dueDateFrom: '2026-05-01' });
    useUiStore.getState().resetFilter();
    expect(useUiStore.getState().activeFilter).toEqual({});
  });

  it('setFilter: 기간 필터 적용', () => {
    useUiStore.getState().setFilter({ dueDateFrom: '2026-05-01', dueDateTo: '2026-05-31' });
    const { activeFilter } = useUiStore.getState();
    expect(activeFilter.dueDateFrom).toBe('2026-05-01');
    expect(activeFilter.dueDateTo).toBe('2026-05-31');
  });
});
