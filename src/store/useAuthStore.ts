import { create } from "zustand";
import { authApi, AuthUser } from "../lib/api";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  register: (data: { username: string; email: string; password: string; penName: string }) => Promise<boolean>;
  login: (data: { email: string; password: string }) => Promise<boolean>;
  logout: () => void;
  loadUser: () => void;
  clearError: () => void;
}

const getStoredToken = () => {
  try {
    return localStorage.getItem("novel_token");
  } catch {
    return null;
  }
};

const setStoredToken = (token: string | null) => {
  try {
    if (token) {
      localStorage.setItem("novel_token", token);
    } else {
      localStorage.removeItem("novel_token");
    }
  } catch {
    // ignore
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: getStoredToken(),
  loading: false,
  error: null,
  isAuthenticated: false,

  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const result = await authApi.register(data);
      if (result.success) {
        setStoredToken(result.token);
        set({ user: result.user, token: result.token, isAuthenticated: true, loading: false });
        return true;
      }
      set({ error: result.message || "注册失败", loading: false });
      return false;
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      return false;
    }
  },

  login: async (data) => {
    set({ loading: true, error: null });
    try {
      const result = await authApi.login(data);
      if (result.success) {
        setStoredToken(result.token);
        set({ user: result.user, token: result.token, isAuthenticated: true, loading: false });
        return true;
      }
      set({ error: result.message || "登录失败", loading: false });
      return false;
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      return false;
    }
  },

  logout: () => {
    setStoredToken(null);
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUser: async () => {
    const token = getStoredToken();
    if (!token) return;

    set({ loading: true });
    try {
      const result = await authApi.getCurrentUser();
      if (result.success) {
        set({ user: result.user, token, isAuthenticated: true, loading: false });
      } else {
        setStoredToken(null);
        set({ user: null, token: null, isAuthenticated: false, loading: false });
      }
    } catch {
      setStoredToken(null);
      set({ user: null, token: null, isAuthenticated: false, loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
