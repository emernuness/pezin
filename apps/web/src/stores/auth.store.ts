import { create } from 'zustand';
import { api } from '@/services/api';
import type { User } from '@pack-do-pezin/shared';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { user, accessToken } = response.data;
    set({ user, accessToken, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh');
      const { accessToken } = response.data;
      set({ accessToken });
    } catch {
      set({ user: null, accessToken: null, isAuthenticated: false });
      throw new Error('Failed to refresh token');
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
}));
