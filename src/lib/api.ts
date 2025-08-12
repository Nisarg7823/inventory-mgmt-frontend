export type LoginRequest = {
  username: string;
  password: string;
};

export type SignupRequest = {
  name?: string;
  username: string;
  password: string;
};

export type AuthResponse = {
  token?: string;
  access_token?: string;
  user?: unknown;
  [key: string]: unknown;
};

export type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  stockQuantity: number | null;
  reorderLevel: number | null;
  lowStock: boolean;
};

export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL;
  // Default to a common local backend port if not provided
  return fromEnv && fromEnv.trim().length > 0 ? fromEnv : "http://localhost:8080";
}

function getLoginPath(): string {
  return process.env.NEXT_PUBLIC_AUTH_LOGIN_PATH || "/auth/login";
}

function getSignupPath(): string {
  return process.env.NEXT_PUBLIC_AUTH_SIGNUP_PATH || "/auth/signup";
}

function getMePath(): string {
  return process.env.NEXT_PUBLIC_AUTH_ME_PATH || "/auth/me";
}

function getInventoryHistoryPath(): string {
  return process.env.NEXT_PUBLIC_INVENTORY_HISTORY_PATH || "/api/inventory/history";
}

function getInventoryPath(): string {
  return process.env.NEXT_PUBLIC_INVENTORY_PATH || "/api/inventory";
}

function shouldUseCookies(): boolean {
  return (process.env.NEXT_PUBLIC_AUTH_WITH_COOKIES || "false").toLowerCase() === "true";
}

export async function apiLogin(payload: LoginRequest): Promise<AuthResponse> {
  const res = await fetch(`${getApiBaseUrl()}${getLoginPath()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...(shouldUseCookies() ? { credentials: "include" as const } : {}),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Login failed with status ${res.status}`);
  }
  return (await res.json()) as AuthResponse;
}

export async function apiSignup(payload: SignupRequest): Promise<AuthResponse> {
  const res = await fetch(`${getApiBaseUrl()}${getSignupPath()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...(shouldUseCookies() ? { credentials: "include" as const } : {}),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Signup failed with status ${res.status}`);
  }
  return (await res.json()) as AuthResponse;
}

export async function apiGetProfile(token?: string): Promise<unknown> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getMePath()}`, {
    method: "GET",
    headers,
    ...(shouldUseCookies() ? { credentials: "include" as const } : {}),
    cache: "no-store",
  });
  if (!res.ok) {
    const err: any = new Error(`Fetching profile failed with status ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function apiGetInventoryHistory(token?: string, productId?: string): Promise<unknown> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const url = new URL(getInventoryHistoryPath(), getApiBaseUrl());
  if (productId) url.searchParams.set("productId", productId);
  const res = await fetch(url.toString(), {
    method: "GET",
    headers,
    ...(shouldUseCookies() ? { credentials: "include" as const } : {}),
    cache: "no-store",
  });
  if (!res.ok) {
    const err: any = new Error(`Fetching inventory failed with status ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function apiGetInventory(token?: string): Promise<InventoryItem[]> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getInventoryPath()}`, {
    method: "GET",
    headers,
    ...(shouldUseCookies() ? { credentials: "include" as const } : {}),
  });
  if (!res.ok) {
    const err: any = new Error(`Fetching inventory failed with status ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return (await res.json()) as InventoryItem[];
}


