export type StoredAuth = {
  token: string;
  users?: unknown;
};

const STORAGE_KEY = "inventory-mgmt";

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
  const t = (response["token"] || response["access_token"] || response["jwtToken"]) as string | undefined;
  return t ?? null;
}

export function extractRoles(response: Record<string, unknown>): string[] {
  // Login response: { username, roles: ["ROLE_ADMIN"], jwtToken }
  const roles = response["roles"];
  if (Array.isArray(roles)) return roles as string[];
  return [];
}
