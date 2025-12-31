import { api } from "@/services/api";
import type { User } from "@pack-do-pezin/shared";
import { create } from "zustand";

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
    try {
      const response = await api.get("/auth/me");
      const { user } = response.data;
      set({ user, isAuthenticated: true });
    } catch (error) {
      console.error("Fetch me error:", error);
      // Don't log out here, just leave user null if fetch fails (e.g. invalid token that will be handled by interceptor)
    }
  },

  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { user, accessToken } = response.data;
    set({ user, accessToken, isAuthenticated: true, isLoading: false });
    return user;
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }
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
