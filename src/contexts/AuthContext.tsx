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
  username: string | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  roleLoading: boolean;
  setAuth: (auth: StoredAuth) => void;
  loginWithToken: (token: string, user?: unknown) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function extractIsAdmin(users: unknown): boolean {
  if (!users || typeof users !== "object") return false;
  const u = users as Record<string, unknown>;
  // Roles stored as string array: ["ROLE_ADMIN"]
  if (Array.isArray(u.roles)) {
    return u.roles.includes("ROLE_ADMIN");
  }
  // Fallback: roles stored as Spring Security authority objects [{ authority: "ROLE_ADMIN" }]
  if (Array.isArray(u.authorities)) {
    return u.authorities.some(
      (r: unknown) =>
        typeof r === "object" &&
        r !== null &&
        (r as Record<string, unknown>).authority === "ROLE_ADMIN"
    );
  }
  return false;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<unknown | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  function applyUser(users: unknown) {
    setUser(users ?? null);
    if (users && typeof users === "object" && users !== null) {
      const u = users as Record<string, unknown>;
      setUsername((u.username as string) || null);
      setIsAdmin(extractIsAdmin(users));
    } else {
      setUsername(null);
      setIsAdmin(false);
    }
  }

  // Initialize from localStorage
  useEffect(() => {
    const stored = getStoredAuth();
    if (stored?.token) {
      setToken(stored.token);
      applyUser(stored.users);
    }
    setLoading(false);
  }, []);

  // Sync across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "inventory-mgmt") {
        const next = getStoredAuth();
        setToken(next?.token ?? null);
        applyUser(next?.users);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setAuth = useCallback((auth: StoredAuth) => {
    setToken(auth.token);
    applyUser(auth.users);
    storeAuth(auth);
  }, []);

  const loginWithToken = useCallback(
    (newToken: string, newUser?: unknown) => {
      const next: StoredAuth = { token: newToken, users: newUser };
      setAuth(next);
    },
    [setAuth]
  );

  const logout = useCallback(() => {
    clearAuth();
    setToken(null);
    setUser(null);
    setUsername(null);
    setIsAdmin(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      username,
      isAdmin,
      isAuthenticated: Boolean(token),
      loading,
      roleLoading: false, // roles are now read synchronously from stored auth
      setAuth,
      loginWithToken,
      logout,
    }),
    [token, user, username, isAdmin, loading, setAuth, loginWithToken, logout]
  );

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
