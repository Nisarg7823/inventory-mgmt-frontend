"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { StoredAuth, clearAuth, getStoredAuth, storeAuth } from "@/lib/auth";

type AuthContextValue = {
  token: string | null;
  user: unknown | null;
  isAuthenticated: boolean;
  loading: boolean;
  setAuth: (auth: StoredAuth) => void;
  loginWithToken: (token: string, user?: unknown) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<unknown | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize from localStorage
  useEffect(() => {
    const stored = getStoredAuth();
    if (stored?.token) {
      setToken(stored.token);
      setUser(stored.user ?? null);
    }
    setLoading(false);
  }, []);

  // Sync across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "inventory_auth") {
        const next = getStoredAuth();
        setToken(next?.token ?? null);
        setUser(next?.user ?? null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setAuth = useCallback((auth: StoredAuth) => {
    setToken(auth.token);
    setUser(auth.user ?? null);
    storeAuth(auth);
  }, []);

  const loginWithToken = useCallback((newToken: string, newUser?: unknown) => {
    const next: StoredAuth = { token: newToken, user: newUser };
    setAuth(next);
  }, [setAuth]);

  const logout = useCallback(() => {
    clearAuth();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    token,
    user,
    isAuthenticated: Boolean(token),
    loading,
    setAuth,
    loginWithToken,
    logout,
  }), [token, user, loading, setAuth, loginWithToken, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useIsAuthenticated(): { loading: boolean; isAuthenticated: boolean } {
  const { loading, isAuthenticated } = useAuth();
  return { loading, isAuthenticated };
}


