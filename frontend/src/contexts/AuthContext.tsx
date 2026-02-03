"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as authApi from "@/lib/auth-api";
import type { AuthUser } from "@/types/auth";

const STORAGE_KEY = "universe_auth";

function loadStored(): { user: AuthUser; token: string } | null {
  if (globalThis.window === undefined) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { user: AuthUser; token: string };
    if (data?.token && data?.user?.userId) return data;
  } catch {
    // ignore
  }
  return null;
}

function saveStored(user: AuthUser, token: string) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
  } catch {
    // ignore
  }
}

function clearStored() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const stored = loadStored();
    if (stored) {
      setUser(stored.user);
      setToken(stored.token);
    }
    setInitialized(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      const authUser: AuthUser = {
        userId: res.userId,
        email: res.email,
        displayName: res.displayName,
      };
      setUser(authUser);
      setToken(res.token);
      saveStored(authUser, res.token);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, displayName: string) => {
      setLoading(true);
      try {
        const res = await authApi.register({ email, password, displayName });
        const authUser: AuthUser = {
          userId: res.userId,
          email: res.email,
          displayName: res.displayName,
        };
        setUser(authUser);
        setToken(res.token);
        saveStored(authUser, res.token);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    clearStored();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      initialized,
      login,
      register,
      logout,
    }),
    [user, token, loading, initialized, login, register, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
