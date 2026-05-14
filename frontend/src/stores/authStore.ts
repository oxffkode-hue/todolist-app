import { create } from 'zustand';
import type { User } from '../types/user.types';
import i18n from '../i18n';

function applyDarkMode(enabled: boolean) {
  if (enabled) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

function applyLanguage(language: string) {
  document.documentElement.lang = language;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,

  setAuth: (token, user) => {
    applyDarkMode(user.darkMode ?? false);
    const lang = user.language ?? 'ko';
    void i18n.changeLanguage(lang);
    applyLanguage(lang);
    set({ accessToken: token, user, isAuthenticated: true });
  },

  clearAuth: () => {
    applyDarkMode(false);
    set({ accessToken: null, user: null, isAuthenticated: false });
  },

  updateUser: (updated) =>
    set((state) => {
      if (!state.user) return {};
      const next = { ...state.user, ...updated };
      if (updated.darkMode !== undefined) applyDarkMode(updated.darkMode);
      if (updated.language !== undefined) {
        void i18n.changeLanguage(updated.language);
        applyLanguage(updated.language);
      }
      return { user: next };
    }),
}));
