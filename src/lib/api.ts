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

export type UserDetails = {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL;
  // Default to a common local backend port if not provided
  return fromEnv && fromEnv.trim().length > 0 ? fromEnv : "http://localhost:8080";
}

function getLoginPath(): string {
  return process.env.NEXT_PUBLIC_AUTH_LOGIN_PATH || "/api/auth/login";
}

function getSignupPath(): string {
  return process.env.NEXT_PUBLIC_AUTH_SIGNUP_PATH || "/api/user/register";
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

function getUserByUsername(): string {
  return process.env.NEXT_PUBLIC_USERS_PATH || "/api/user/users";
}

function shouldUseCookies(): boolean {
  return (process.env.NEXT_PUBLIC_AUTH_WITH_COOKIES || "false").toLowerCase() === "true";
}

function getUserRole(): string{
  return process.env.NEXT_PUBLIC_USER_ROLE_PATH || ""
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

export async function apiGetUserByUsername(username: string, token?:string): Promise<UserDetails> {
    const headers: Record<string, string> = {};
    if(token) headers["Authorization"]= `Bearer ${token}`;
    const res = await fetch(`${getApiBaseUrl()}${getUserByUsername()}${username}`, {
      method: "GET",
      headers,
      ...(shouldUseCookies() ? { credentials: "include" as const } : {}),
      cache: "no-store",
    })
    if(!res.ok) {
      const err: any = new Error(`Fetching user by username failed with status ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return (await res.json()) as UserDetails;
}

export async function apiGetUserRole(username: string, token?: string): Promise<Array<{ authority: string }>> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  console.log(username)
  const res = await fetch(`${getApiBaseUrl()}${getUserRole()}${username}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch user role");
  return res.json();
}

// Admin API endpoints
function getAdminSystemSettingsPath(): string {
  return process.env.NEXT_PUBLIC_ADMIN_SYSTEM_SETTINGS_PATH || "/api/admin/system/settings";
}

function getAdminAnalyticsPath(): string {
  return process.env.NEXT_PUBLIC_ADMIN_ANALYTICS_PATH || "/api/admin/analytics";
}

function getAdminBackupPath(): string {
  return process.env.NEXT_PUBLIC_ADMIN_BACKUP_PATH || "/api/admin/backup";
}

function getAdminAuditLogsPath(): string {
  return process.env.NEXT_PUBLIC_ADMIN_AUDIT_LOGS_PATH || "/api/admin/audit-logs";
}

function getAdminBulkOperationsPath(): string {
  return process.env.NEXT_PUBLIC_ADMIN_BULK_OPERATIONS_PATH || "/api/admin/bulk-operations";
}

function getAdminUsersPath(): string {
  return process.env.NEXT_PUBLIC_ADMIN_USERS_PATH || "/api/admin/users";
}

function getAdminInventoryExportPath(): string {
  return process.env.NEXT_PUBLIC_ADMIN_INVENTORY_EXPORT_PATH || "/api/admin/inventory/export";
}

function getAdminInventoryImportPath(): string {
  return process.env.NEXT_PUBLIC_ADMIN_INVENTORY_IMPORT_PATH || "/api/admin/inventory/import";
}

function getAdminStockAlertsPath(): string {
  return process.env.NEXT_PUBLIC_ADMIN_STOCK_ALERTS_PATH || "/api/admin/inventory/stock-alerts";
}

function getAdminInventoryReportsPath(): string {
  return process.env.NEXT_PUBLIC_ADMIN_INVENTORY_REPORTS_PATH || "/api/admin/inventory/reports";
}

// Admin API functions
export async function apiGetSystemSettings(token?: string): Promise<any> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getAdminSystemSettingsPath()}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch system settings");
  return res.json();
}

export async function apiUpdateSystemSettings(settings: any, token?: string): Promise<any> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getAdminSystemSettingsPath()}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error("Failed to update system settings");
  return res.json();
}

export async function apiGetAnalytics(token?: string): Promise<any> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getAdminAnalyticsPath()}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}

export async function apiCreateBackup(token?: string): Promise<any> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getAdminBackupPath()}`, {
    method: "POST",
    headers,
  });
  if (!res.ok) throw new Error("Failed to create backup");
  return res.json();
}

export async function apiGetAuditLogs(token?: string, page: number = 1, limit: number = 50): Promise<any> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const url = new URL(getAdminAuditLogsPath(), getApiBaseUrl());
  url.searchParams.set("page", page.toString());
  url.searchParams.set("limit", limit.toString());
  
  const res = await fetch(url.toString(), {
    method: "GET",
    headers,
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch audit logs");
  return res.json();
}

export async function apiBulkUpdateInventory(updates: any[], token?: string): Promise<any> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getAdminBulkOperationsPath()}/inventory`, {
    method: "PUT",
    headers,
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to bulk update inventory");
  return res.json();
}

export async function apiGetAllUsers(token?: string): Promise<any[]> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getAdminUsersPath()}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function apiUpdateUserRole(userId: string, role: string, token?: string): Promise<any> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getAdminUsersPath()}/${userId}/role`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error("Failed to update user role");
  return res.json();
}

export async function apiExportInventory(token?: string): Promise<Blob> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getAdminInventoryExportPath()}`, {
    method: "GET",
    headers,
  });
  if (!res.ok) throw new Error("Failed to export inventory");
  return res.blob();
}

export async function apiImportInventory(file: File, token?: string): Promise<any> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  
  const formData = new FormData();
  formData.append("file", file);
  
  const res = await fetch(`${getApiBaseUrl()}${getAdminInventoryImportPath()}`, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to import inventory");
  return res.json();
}

export async function apiGetStockAlerts(token?: string): Promise<any[]> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getAdminStockAlertsPath()}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch stock alerts");
  return res.json();
}

export async function apiUpdateStockAlerts(alerts: any, token?: string): Promise<any> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getAdminStockAlertsPath()}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(alerts),
  });
  if (!res.ok) throw new Error("Failed to update stock alerts");
  return res.json();
}

export async function apiGenerateInventoryReportAdmin(reportType: string, filters: any, token?: string): Promise<Blob> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getAdminInventoryReportsPath()}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ reportType, filters }),
  });
  if (!res.ok) throw new Error("Failed to generate inventory report");
  return res.blob();
}

// Product API endpoints
function getProductsPath(): string {
  return process.env.NEXT_PUBLIC_PRODUCTS_PATH || "/api/products";
}

function getOrdersPath(): string {
  return process.env.NEXT_PUBLIC_ORDERS_PATH || "/api/orders";
}

function getCustomersPath(): string {
  return process.env.NEXT_PUBLIC_CUSTOMERS_PATH || "/api/customers";
}

function getSuppliersPath(): string {
  return process.env.NEXT_PUBLIC_SUPPLIERS_PATH || "/api/suppliers";
}

function getWarehousePath(): string {
  return process.env.NEXT_PUBLIC_WAREHOUSE_PATH || "/api/warehouse";
}

function getNotificationsPath(): string {
  return process.env.NEXT_PUBLIC_NOTIFICATIONS_PATH || "/api/notifications";
}

function getReportsPath(): string {
  return process.env.NEXT_PUBLIC_REPORTS_PATH || "/api/reports";
}

// Product API functions
export async function apiGetAllProducts(token?: string): Promise<any[]> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getProductsPath()}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function apiGetProductById(id: string, token?: string): Promise<any> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getProductsPath()}/${id}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

export async function apiCreateProduct(product: any, token?: string): Promise<any> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getProductsPath()}`, {
    method: "POST",
    headers,
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Failed to create product");
  return res.json();
}

export async function apiUpdateProduct(id: string, product: any, token?: string): Promise<any> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getProductsPath()}/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Failed to update product");
  return res.json();
}

export async function apiDeleteProduct(id: string, token?: string): Promise<any> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getProductsPath()}/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Failed to delete product");
  return res.json();
}

// Order API functions
export async function apiGetAllOrders(token?: string, filters?: any): Promise<any[]> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  
  const url = new URL(getOrdersPath(), getApiBaseUrl());
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }
  
  const res = await fetch(url.toString(), {
    method: "GET",
    headers,
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

export async function apiGetOrderById(id: string, token?: string): Promise<any> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getOrdersPath()}/${id}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch order");
  return res.json();
}

export async function apiCreateOrder(order: any, token?: string): Promise<any> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getOrdersPath()}`, {
    method: "POST",
    headers,
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error("Failed to create order");
  return res.json();
}

export async function apiUpdateOrder(id: string, order: any, token?: string): Promise<any> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getOrdersPath()}/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error("Failed to update order");
  return res.json();
}

// Customer API functions
export async function apiGetAllCustomers(token?: string, page: number = 0, size: number = 50, search?: string): Promise<any> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  
  const url = new URL(getCustomersPath(), getApiBaseUrl());
  url.searchParams.set("page", page.toString());
  url.searchParams.set("size", size.toString());
  if (search) url.searchParams.set("search", search);
  
  const res = await fetch(url.toString(), {
    method: "GET",
    headers,
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch customers");
  return res.json();
}

export async function apiGetCustomerById(id: string, token?: string): Promise<any> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getCustomersPath()}/${id}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch customer");
  return res.json();
}

export async function apiCreateCustomer(customer: any, token?: string): Promise<any> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getCustomersPath()}`, {
    method: "POST",
    headers,
    body: JSON.stringify(customer),
  });
  if (!res.ok) throw new Error("Failed to create customer");
  return res.json();
}

export async function apiUpdateCustomer(id: string, customer: any, token?: string): Promise<any> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getCustomersPath()}/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(customer),
  });
  if (!res.ok) throw new Error("Failed to update customer");
  return res.json();
}

export async function apiDeleteCustomer(id: string, token?: string): Promise<any> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getCustomersPath()}/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Failed to delete customer");
  return res.json();
}

// Supplier API functions
export async function apiGetAllSuppliers(token?: string): Promise<any> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getSuppliersPath()}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch suppliers");
  return res.json();
}

export async function apiGetSupplierById(id: string, token?: string): Promise<any> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getSuppliersPath()}/${id}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch supplier");
  return res.json();
}

export async function apiCreateSupplier(supplier: any, token?: string): Promise<any> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getSuppliersPath()}`, {
    method: "POST",
    headers,
    body: JSON.stringify(supplier),
  });
  if (!res.ok) throw new Error("Failed to create supplier");
  return res.json();
}

export async function apiUpdateSupplier(id: string, supplier: any, token?: string): Promise<any> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getSuppliersPath()}/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(supplier),
  });
  if (!res.ok) throw new Error("Failed to update supplier");
  return res.json();
}

export async function apiDeleteSupplier(id: string, token?: string): Promise<any> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getSuppliersPath()}/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Failed to delete supplier");
  return res.json();
}

// Warehouse API functions
export async function apiGetWarehouseOverview(token?: string): Promise<any> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getWarehousePath()}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch warehouse overview");
  return res.json();
}

export async function apiGetProductsByLocation(location: string, token?: string): Promise<any> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getWarehousePath()}/${encodeURIComponent(location)}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch products by location");
  return res.json();
}

// Notification API functions
export async function apiGetAllNotifications(token?: string): Promise<any> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getNotificationsPath()}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

export async function apiGetLowStockNotifications(token?: string): Promise<any> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getNotificationsPath()}/low-stock`, {
    method: "GET",
    headers,
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch low stock notifications");
  return res.json();
}

export async function apiGetOutOfStockNotifications(token?: string): Promise<any> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getNotificationsPath()}/out-of-stock`, {
    method: "GET",
    headers,
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch out of stock notifications");
  return res.json();
}

// Report API functions
export async function apiGenerateOrderReport(reportType: string, filters: any, token?: string): Promise<Blob> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getReportsPath()}/orders`, {
    method: "POST",
    headers,
    body: JSON.stringify({ reportType, filters }),
  });
  if (!res.ok) throw new Error("Failed to generate order report");
  return res.blob();
}

export async function apiGenerateCustomerReport(reportType: string, filters: any, token?: string): Promise<Blob> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBaseUrl()}${getReportsPath()}/customers`, {
    method: "POST",
    headers,
    body: JSON.stringify({ reportType, filters }),
  });
  if (!res.ok) throw new Error("Failed to generate customer report");
  return res.blob();
}