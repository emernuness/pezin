import { api } from "@/services/api";
import type { User } from "@pack-do-pezin/shared";
import { create } from "zustand";

// Check if we have a refresh token cookie (can't read HttpOnly, but we can check if auth was attempted)
const hasAuthCookie = () => {
  if (typeof document === 'undefined') return false;
  // Check for any auth-related cookie or localStorage flag
  return localStorage.getItem('auth_attempted') === 'true';
};

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  setUser: (user: User | null) => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  isAuthenticated: false,

  fetchMe: async () => {
    // Skip API call if no auth was ever attempted (avoids 401 errors)
    if (!hasAuthCookie()) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const response = await api.get("/auth/me");
      const { user } = response.data;
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      // Clear auth flag on 401
      localStorage.removeItem('auth_attempted');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { user, accessToken } = response.data;
    // Mark that auth was attempted for future page loads
    localStorage.setItem('auth_attempted', 'true');
    set({ user, accessToken, isAuthenticated: true, isLoading: false });
    return user;
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore logout errors
    }
    localStorage.removeItem('auth_attempted');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  refreshToken: async () => {
    try {
      const response = await api.post("/auth/refresh");
      const { accessToken } = response.data;
      set({ accessToken });
    } catch {
      set({ user: null, accessToken: null, isAuthenticated: false });
      throw new Error("Failed to refresh token");
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
}));
