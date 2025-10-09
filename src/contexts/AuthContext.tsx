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
import { apiGetUserRole } from "@/lib/api";

type AuthContextValue = {
  token: string | null;
  user: unknown | null;
  username: string | null;
  isAdmin: boolean;
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
  const [username, setUsername] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch user role when token changes
  useEffect(() => {
    if (!token || !username) {
      setIsAdmin(false);
      return;
    }
    
    apiGetUserRole(username, token)
      .then((roles) => {
        const hasAdminRole = roles.some(role => role.authority === "ROLE_ADMIN");
        setIsAdmin(hasAdminRole);
      })
      .catch(() => {
        setIsAdmin(false);
      });
  }, [token, username]);

  // Initialize from localStorage
  useEffect(() => {
    const stored = getStoredAuth();
    if (stored?.token) {
      setToken(stored.token);
      setUser(stored.users ?? null);
      // Try to extract username from user object
      if (stored.users && typeof stored.users === "object" && stored.users !== null) {
        // @ts-ignore
        setUsername(stored.users.username || null);
        console.log(stored.users)
      } else {
        setUsername(null);
      }
    }
    setLoading(false);
  }, []);

  // Sync across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "inventory-mgmt") {
        const next = getStoredAuth();
        setToken(next?.token ?? null);
        setUser(next?.users ?? null);
        if (next?.users && typeof next?.users === "object" && next?.users !== null) {
          // @ts-ignore
          setUsername(next?.users.username || null);
        } else {
          setUsername(null);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setAuth = useCallback((auth: StoredAuth) => {
    setToken(auth.token);
    setUser(auth.users ?? null);
    if (auth.users && typeof auth.users === "object" && auth.users !== null) {
      // @ts-ignore
      setUsername(auth.users.username || null);
    } else {
      setUsername(null);
    }
    storeAuth(auth);
  }, []);

  const loginWithToken = useCallback((newToken: string, newUser?: unknown) => {
    const next: StoredAuth = { token: newToken, users: newUser };
    setAuth(next);
  }, [setAuth]);

  const logout = useCallback(() => {
    clearAuth();
    setToken(null);
    setUser(null);
    setUsername(null);
    setIsAdmin(false);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    token,
    user,
    username,
    isAdmin,
    isAuthenticated: Boolean(token),
    loading,
    setAuth,
    loginWithToken,
    logout,
  }), [token, user, username, isAdmin, loading, setAuth, loginWithToken, logout]);

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


