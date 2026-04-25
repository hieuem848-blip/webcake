const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export const getAdminToken = () =>
  typeof window === "undefined" ? null : localStorage.getItem("adminToken");
export const setAdminToken = (t: string) => localStorage.setItem("adminToken", t);
export const removeAdminToken = () => localStorage.removeItem("adminToken");

async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 || res.status === 403) {
    removeAdminToken();
    if (typeof window !== "undefined") window.location.href = "/admin/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Lỗi không xác định" }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  if (res.status === 204) return {} as T;
  return res.json();
}

// ── AUTH ─────────────────────────────────────────────────────────────────────
export const adminAuthApi = {
  login: async (data: { email: string; password: string }) => {
    const res = await adminFetch<{ accessToken: string; user: AdminUser }>("/admin/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.accessToken) setAdminToken(res.accessToken);
    return res;
  },
  logout: () => {
    removeAdminToken();
  },
  me: () => adminFetch<{ user: AdminUser }>("/admin/auth/me"),
};

// ── TYPES ────────────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "STAFF";
}

export interface DashboardData {
  users: { total: number };
  orders: { total: number; pending: number; confirmed: number; shipping: number; completed: number; cancelled: number };
  revenue: { total: number };
  products: { total: number; active: number; customizable: number };
  customCakes: { pending: number; quoted: number; completed: number };
  chats: { open: number; closed: number };
}

export interface AdminProduct {
  _id: string; name: string; description: string; basePrice: number;
  category: { _id: string; name: string; slug: string } | string;
  isCustomizable: boolean; status: "active" | "inactive"; createdAt: string;
}
export interface AdminProductDetail {
  product: AdminProduct;
  variants: { _id: string; size: string; serving: string; price: number }[];
  images: { _id: string; imageUrl: string; isMain: boolean }[];
}

export interface AdminCategory {
  _id: string; name: string; slug: string; description?: string;
  isActive: boolean; isDeleted: boolean; createdAt: string;
}

export interface AdminOrder {
  _id: string; totalPrice: number;
  status: "pending" | "confirmed" | "shipping" | "completed" | "cancelled";
  orderType: "normal" | "custom"; createdAt: string;
  user?: { _id: string; displayName: string; email: string; phone: string };
  address?: { receiverName: string; phone: string; address: string };
  paymentMethod?: "cod" | "momo" | "vnpay" | null;
  orderItems?: { product?: { name: string }; customRequest?: { description: string }; quantity: number }[];
}
export interface AdminOrderDetail {
  order: AdminOrder;
  items: { _id: string; product?: AdminProduct; variant?: { _id: string; size: string; serving: string; price: number }; price: number; quantity: number }[];
}

export interface AdminUserItem {
  _id: string; username: string; email: string; phone: string;
  displayName: string; status: "active" | "inactive" | "deleted";
  role: string; createdAt: string; avatarUrl?: string;
}

export interface CustomCakeRequest {
  _id: string; status: "pending" | "quoted" | "accepted" | "rejected" | "completed";
  description: string; note?: string; quotedPrice?: number; adminNote?: string;
  createdAt: string;
  user?: { _id: string; displayName: string; email: string; phone: string };
}

// ── DASHBOARD ────────────────────────────────────────────────────────────────
export const adminDashboardApi = {
  get: () => adminFetch<DashboardData>("/admin/dashboards"),
  getMonthlyRevenue: (year?: number) =>
    adminFetch<{ year: number; monthly: { month: string; revenue: number; orders: number }[] }>(
      `/admin/dashboards/monthly-revenue${year ? `?year=${year}` : ""}`
    ),
  getDailyRevenue: (year?: number, month?: number) => {
    const params = new URLSearchParams();
    if (year)  params.set("year",  String(year));
    if (month) params.set("month", String(month));
    return adminFetch<{ year: number; month: number; daily: { day: string; revenue: number; orders: number }[] }>(
      `/admin/dashboards/daily-revenue?${params.toString()}`
    );
  },
  getWeeklyRevenue: (year?: number, month?: number) => {
    const params = new URLSearchParams();
    if (year)  params.set("year",  String(year));
    if (month) params.set("month", String(month));
    return adminFetch<{ year: number; month: number; weekly: { week: string; revenue: number; orders: number }[] }>(
      `/admin/dashboards/weekly-revenue?${params.toString()}`
    );
  },
  getTopProducts: (limit = 5) =>
    adminFetch<{ topProducts: { productId: string; name: string; totalQuantity: number; totalRevenue: number }[] }>(
      `/admin/dashboards/top-products?limit=${limit}`
    ),
  getTopCustomers: (limit = 5) =>
    adminFetch<{ topCustomers: { userId: string; name: string; email: string; totalOrders: number; totalSpent: number }[] }>(
      `/admin/dashboards/top-customers?limit=${limit}`
    ),
};

// ── INVENTORY ────────────────────────────────────────────────────────────────
export type IngredientCategory = "bot_duong" | "chat_long" | "trung_sua" | "trang_tri" | "bao_bi" | "khac";

export const INGREDIENT_CATEGORIES: Record<IngredientCategory, string> = {
  bot_duong: "Bột & Đường",
  chat_long: "Chất lỏng & Dầu",
  trung_sua: "Trứng & Sữa",
  trang_tri: "Trang trí & Hương liệu",
  bao_bi: "Bao bì & Dụng cụ",
  khac: "Khác",
};

export interface Ingredient {
  _id: string;
  name: string;
  category: IngredientCategory;
  unit: string;
  stock: number;
  minThreshold: number;
  costPrice: number;
  supplier: string;
  note: string;
  createdAt: string;
  // virtual fields from backend
  nearestExpiry?: string | null;
  expiringBatchNote?: string | null;
  isExpiringSoon?: boolean;
  isLowStock?: boolean;
}

export type MovementType = "import" | "export" | "spoilage" | "adjust";

export interface InventoryLog {
  _id: string;
  ingredient: { _id: string; name: string; unit: string; category: string } | string;
  ingredientName: string;
  ingredientUnit: string;
  type: MovementType;
  quantity: number;
  costPrice: number;
  supplier: string;
  expiryDate?: string | null;
  batchNote: string;
  reason: string;
  stockBefore: number;
  stockAfter: number;
  createdBy?: { _id: string; displayName: string } | string;
  createdAt: string;
}

export interface InventoryStats {
  total: number;
  lowStock: number;
  totalValue: number;
  todayTransactions: number;
  expiringSoonCount: number;
  monthly: { import: number; export: number; spoilage: number };
}

export interface ExpiryAlert {
  ingredient: { _id: string; name: string; unit: string; stock: number };
  batches: { _id: string; quantity: number; expiryDate: string; batchNote: string; daysLeft: number }[];
}

export interface LogsResponse {
  logs: InventoryLog[];
  total: number;
  page: number;
  totalPages: number;
}

export const adminInventoryApi = {
  getStats: () => adminFetch<InventoryStats>("/admin/inventory/stats"),

  getAll: (params?: { category?: string; lowStock?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set("category", params.category);
    if (params?.lowStock) q.set("lowStock", params.lowStock);
    if (params?.search) q.set("search", params.search);
    const qs = q.toString();
    return adminFetch<{ ingredients: Ingredient[] }>(`/admin/inventory${qs ? `?${qs}` : ""}`);
  },

  create: (data: {
    name: string; unit: string; category?: string; stock?: number;
    minThreshold?: number; costPrice?: number; supplier?: string; note?: string;
  }) => adminFetch<{ ingredient: Ingredient }>("/admin/inventory", {
    method: "POST", body: JSON.stringify(data),
  }),

  update: (id: string, data: Partial<Omit<Ingredient, "_id" | "createdAt" | "stock">>) =>
    adminFetch<{ ingredient: Ingredient }>(`/admin/inventory/${id}`, {
      method: "PUT", body: JSON.stringify(data),
    }),

  delete: (id: string) => adminFetch(`/admin/inventory/${id}`, { method: "DELETE" }),

  movement: (id: string, data: {
    type: MovementType; quantity: number; reason?: string;
    costPrice?: number; supplier?: string; expiryDate?: string; batchNote?: string;
  }) => adminFetch<{ ingredient: Ingredient; log: InventoryLog }>(`/admin/inventory/${id}/movement`, {
    method: "POST", body: JSON.stringify(data),
  }),

  getLogs: (params?: {
    ingredientId?: string; type?: string; fromDate?: string; toDate?: string;
    page?: number; limit?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.ingredientId) q.set("ingredientId", params.ingredientId);
    if (params?.type) q.set("type", params.type);
    if (params?.fromDate) q.set("fromDate", params.fromDate);
    if (params?.toDate) q.set("toDate", params.toDate);
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    return adminFetch<LogsResponse>(`/admin/inventory/logs?${q}`);
  },

  getExpiryAlerts: () => adminFetch<{ alerts: ExpiryAlert[] }>("/admin/inventory/expiry-alerts"),

  exportCSV: (token: string) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"}/admin/inventory/export-csv`;
    const a = document.createElement("a");
    a.href = url + `?token=${token}`;
    // Use Authorization header via fetch instead
    adminFetch<Blob>("/admin/inventory/export-csv").then(() => {});
    // Direct download approach:
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `ton-kho-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(blobUrl);
      });
  },

  exportLogsCSV: (token: string, params?: { fromDate?: string; toDate?: string; type?: string }) => {
    const q = new URLSearchParams();
    if (params?.fromDate) q.set("fromDate", params.fromDate);
    if (params?.toDate) q.set("toDate", params.toDate);
    if (params?.type) q.set("type", params.type);
    const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
    const url = `${BASE}/admin/inventory/export-logs-csv?${q}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `lich-su-kho-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(blobUrl);
      });
  },

  importExcel: (file: File): Promise<{
    success: number; failed: number;
    results: { row: number; name: string; quantity: number; unit: string; stockAfter: number; isNew: boolean }[];
    errors: { row: number; name?: string; message: string }[];
  }> => {
    const token = getAdminToken();
    const formData = new FormData();
    formData.append("file", file);
    const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
    return fetch(`${BASE}/admin/inventory/import-excel`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then(async (r) => {
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || "Lỗi nhập kho");
      return data;
    });
  },
};

// ── PRODUCTS ─────────────────────────────────────────────────────────────────
export const adminProductApi = {
  getAll: (params?: { page?: number; limit?: number; keyword?: string; category?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.keyword) q.set("keyword", params.keyword);
    if (params?.category) q.set("category", params.category);
    return adminFetch<{ data: AdminProduct[]; total: number; page: number; totalPages: number }>(`/admin/products?${q}`);
  },
  getById: (id: string) => adminFetch<AdminProductDetail>(`/admin/products/${id}`),
  create: (data: { name: string; description: string; basePrice: number; category: string; isCustomizable: boolean }) =>
    adminFetch<{ product: AdminProduct }>("/admin/products", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<AdminProduct>) =>
    adminFetch<{ product: AdminProduct }>(`/admin/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  hide: (id: string) => adminFetch(`/admin/products/${id}/hide`, { method: "PATCH" }),
  show: (id: string) => adminFetch(`/admin/products/${id}/show`, { method: "PATCH" }),
  delete: (id: string) => adminFetch(`/admin/products/${id}`, { method: "DELETE" }),
  addVariant: (data: { productId: string; size: string; serving: string; price: number }) =>
    adminFetch("/admin/products/variant/add", { method: "POST", body: JSON.stringify(data) }),
  deleteVariant: (id: string) => adminFetch(`/admin/products/variant/${id}`, { method: "DELETE" }),
  addImage: (data: { productId: string; imageUrl?: string; imageBase64?: string; isMain: boolean }) =>
    adminFetch("/admin/products/image/add", { method: "POST", body: JSON.stringify(data) }),
  deleteImage: (id: string) => adminFetch(`/admin/products/image/${id}`, { method: "DELETE" }),
  setMainImage: (id: string) => adminFetch(`/admin/products/image/${id}/main`, { method: "PATCH" }),
};

// ── CATEGORIES ───────────────────────────────────────────────────────────────
export const adminCategoryApi = {
  getAll: (params?: { page?: number; limit?: number; keyword?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.keyword) q.set("keyword", params.keyword || "");
    return adminFetch<{ categories: AdminCategory[]; total: number; totalPages: number }>(`/admin/categories?${q}`);
  },
  create: (data: { name: string; description?: string }) =>
    adminFetch<AdminCategory>("/admin/categories", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string; description?: string; isActive?: boolean }) =>
    adminFetch<AdminCategory>(`/admin/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => adminFetch(`/admin/categories/${id}`, { method: "DELETE" }),
  toggle: (id: string) => adminFetch<AdminCategory>(`/admin/categories/${id}/toggle`, { method: "PATCH" }),
};

// ── ORDERS ───────────────────────────────────────────────────────────────────
export const adminOrderApi = {
  getAll: (params?: { status?: string; fromDate?: string; toDate?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.fromDate) q.set("fromDate", params.fromDate);
    if (params?.toDate) q.set("toDate", params.toDate);
    return adminFetch<AdminOrder[]>(`/admin/orders?${q}`);
  },
  getById: (id: string) => adminFetch<AdminOrderDetail>(`/admin/orders/${id}`),
  updateStatus: (id: string, status: string) =>
    adminFetch(`/admin/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  cancel: (id: string, reason?: string) =>
    adminFetch(`/admin/orders/${id}/cancel`, { method: "PUT", body: JSON.stringify({ reason }) }),
  getStats: () => adminFetch<{ totalOrders: number; completedOrders: number; totalRevenue: number }>("/admin/orders/statistics"),
};

// ── USERS ────────────────────────────────────────────────────────────────────
export const adminUserApi = {
  getAll: (params?: { page?: number; limit?: number; keyword?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.keyword) q.set("keyword", params.keyword || "");
    return adminFetch<{ data: AdminUserItem[]; total: number; totalPages: number }>(`/admin/users?${q}`);
  },
  getById: (id: string) => adminFetch<{ user: AdminUserItem; role: string; orders: AdminOrder[]; totalSpent: number }>(`/admin/users/${id}`),
  update: (id: string, data: { displayName?: string; phone?: string; status?: string }) =>
    adminFetch(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  toggleStatus: (id: string) => adminFetch(`/admin/users/${id}/status`, { method: "PATCH" }),
  assignRole: (id: string, roleName: string) =>
    adminFetch(`/admin/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ roleName }) }),
};

// ── CUSTOM CAKES ─────────────────────────────────────────────────────────────
export const adminCustomCakeApi = {
  getAll: (params?: { status?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    return adminFetch<CustomCakeRequest[]>(`/admin/custom-cakes?${q}`);
  },
  getById: (id: string) => adminFetch<{ request: CustomCakeRequest; images: { imageUrl: string }[] }>(`/admin/custom-cakes/${id}`),
  quote: (id: string, data: { price: number; note?: string }) =>
    adminFetch(`/admin/custom-cakes/${id}/quote`, { method: "PUT", body: JSON.stringify(data) }),
  reject: (id: string, reason?: string) =>
    adminFetch(`/admin/custom-cakes/${id}/reject`, { method: "PUT", body: JSON.stringify({ reason }) }),
  complete: (id: string) => adminFetch(`/admin/custom-cakes/${id}/complete`, { method: "PUT" }),
};

// ── HELPERS ──────────────────────────────────────────────────────────────────
export const formatPrice = (p: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p);

export const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  pending:   { label: "Chờ xác nhận", color: "text-yellow-700 bg-yellow-50 border-yellow-200" },
  confirmed: { label: "Đã xác nhận",  color: "text-blue-700 bg-blue-50 border-blue-200" },
  shipping:  { label: "Đang giao",    color: "text-purple-700 bg-purple-50 border-purple-200" },
  completed: { label: "Hoàn thành",   color: "text-green-700 bg-green-50 border-green-200" },
  cancelled: { label: "Đã hủy",       color: "text-red-700 bg-red-50 border-red-200" },
};

export const CUSTOM_STATUS: Record<string, { label: string; color: string }> = {
  pending:   { label: "Chờ xử lý",  color: "text-yellow-700 bg-yellow-50 border-yellow-200" },
  quoted:    { label: "Đã báo giá", color: "text-blue-700 bg-blue-50 border-blue-200" },
  accepted:  { label: "Đã chấp nhận", color: "text-indigo-700 bg-indigo-50 border-indigo-200" },
  rejected:  { label: "Từ chối",    color: "text-red-700 bg-red-50 border-red-200" },
  completed: { label: "Hoàn thành", color: "text-green-700 bg-green-50 border-green-200" },
};

// ── ADMIN CHAT ────────────────────────────────────────────────────────────────
export interface AdminChatMessage {
  _id: string;
  chat: string;
  sender: { _id: string; displayName: string };
  message: string;
  type: "text" | "image";
  createdAt: string;
}

export interface AdminChatSession {
  _id: string;
  customer: { _id: string; displayName: string; email: string; phone?: string };
  status: "open" | "closed";
  createdAt: string;
  updatedAt: string;
  lastMessage?: AdminChatMessage | null;
}

export const adminChatApi = {
  getAll: () => adminFetch<AdminChatSession[]>("/admin/chats"),
  getDetail: (id: string) => adminFetch<{ chat: AdminChatSession; messages: AdminChatMessage[] }>(`/admin/chats/${id}`),
  sendMessage: (id: string, message: string) =>
    adminFetch<AdminChatMessage>(`/admin/chats/${id}/message`, { method: "POST", body: JSON.stringify({ message }) }),
  closeChat: (id: string) => adminFetch(`/admin/chats/${id}/close`, { method: "PUT" }),
};