export type StoredAuth = {
  token: string;
  user?: unknown;
};

const STORAGE_KEY = "inventory_auth";

export function getStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

export function storeAuth(data: StoredAuth) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function extractToken(response: Record<string, unknown>): string | null {
  // Common fields: token, access_token, jwt
  const t = (response["token"] || response["access_token"] || response["jwtToken"]) as string | undefined;
  return t ?? null;
}



