import { create } from 'zustand';
import type { TodoFilters } from '../types/todo.types';

interface UiState {
  isSidebarOpen: boolean;
  activeFilter: TodoFilters;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setFilter: (filters: TodoFilters) => void;
  resetFilter: () => void;
}

const defaultFilter: TodoFilters = {};

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: false,
  activeFilter: defaultFilter,

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setSidebarOpen: (open) =>
    set({ isSidebarOpen: open }),

  setFilter: (filters) =>
    set({ activeFilter: filters }),

  resetFilter: () =>
    set({ activeFilter: defaultFilter }),
}));
