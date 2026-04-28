const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export const getToken = () => (typeof window === "undefined" ? null : localStorage.getItem("accessToken"));
export const setToken = (t: string) => localStorage.setItem("accessToken", t);
export const removeToken = () => localStorage.removeItem("accessToken");

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers, credentials: "include" });

  if (res.status === 401) {
  const isLogin = path.includes("/auth/signIn");

  if (!isLogin) {
    removeToken();
    // Mở modal đăng nhập thay vì chuyển trang
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth:openLoginModal"));
    }
  }
}

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Lỗi không xác định" }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  if (res.status === 204) return {} as T;
  return res.json();
}

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const authApi = {
  signUp: (data: { username: string; password: string; email: string; phone: string; firstName: string; lastName: string }) =>
    apiFetch<void>("/auth/signUp", { method: "POST", body: JSON.stringify(data) }),

  signIn: async (data: { username: string; password: string }) => {
    const res = await apiFetch<{ accessToken: string; message: string }>(
      "/auth/signIn", { method: "POST", body: JSON.stringify(data) }
    );
    if (res.accessToken) setToken(res.accessToken);
    return res;
  },

  signOut: async () => {
    await apiFetch("/auth/signOut", { method: "POST" }).catch(() => {});
    removeToken();
  },
};

// ── USER ──────────────────────────────────────────────────────────────────────
export interface User { _id: string; username: string; email: string; phone: string; displayName: string; role: string; avatarUrl?: string; }

export const userApi = {
  getMe: () => apiFetch<{ user: User }>("/users/me"),
  getProfile: () => apiFetch<{ user: User; recentOrders: Order[] }>("/users/profile"),
  updateProfile: (data: { fullName?: string; oldPassword?: string; newPassword?: string }) =>
    apiFetch("/users/profile", { method: "PUT", body: JSON.stringify(data) }),
};

// ── PRODUCTS ──────────────────────────────────────────────────────────────────
// ✅ FIX: imageUrl (đúng với model ProductImage), serving: string
export interface ProductImage { _id: string; imageUrl: string; isMain: boolean; }
export interface ProductVariant { _id: string; size: string; serving: string; price: number; }
export interface ApiProduct {
  _id: string; name: string; description: string; basePrice: number;
  category: { _id: string; name: string; slug: string } | string;
  isCustomizable?: boolean; status: string; createdAt: string;
  mainImageUrl?: string; // ✅ thêm trường này để dễ hiển thị ảnh đại diện trong danh sách sản phẩm, lấy từ ProductImage có isMain=true 
}
export interface ApiProductDetail { product: ApiProduct; images: ProductImage[]; variants: ProductVariant[]; }

export const productApi = {
  getAll: (params?: { page?: number; limit?: number; category?: string; search?: string; minPrice?: number; maxPrice?: number }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.category) q.set("category", params.category);
    if (params?.search) q.set("search", params.search);
    if (params?.minPrice) q.set("minPrice", String(params.minPrice));
    if (params?.maxPrice) q.set("maxPrice", String(params.maxPrice));
    return apiFetch<{ total: number; page: number; totalPages: number; products: ApiProduct[] }>(`/products?${q}`);
  },
  getById: (id: string) => apiFetch<ApiProductDetail>(`/products/${id}`),
  getByCategory: (slug: string) => apiFetch<ApiProduct[]>(`/products/category/${slug}`),
};

// ── CATEGORIES ────────────────────────────────────────────────────────────────
export interface ApiCategory { _id: string; name: string; slug: string; description?: string; }

export const categoryApi = {
  getAll: () => apiFetch<ApiCategory[]>("/categories"),
  getBySlug: (slug: string) => apiFetch<ApiCategory>(`/categories/${slug}`),
};

// ── CART ──────────────────────────────────────────────────────────────────────
export interface CartItem { _id: string; product: ApiProduct; variant?: ProductVariant; price: number; quantity: number; }
export interface CartResponse { cartId: string; items: CartItem[]; totalPrice: number; }

export const cartApi = {
  get: () => apiFetch<CartResponse>("/carts"),
  add: (data: { productId: string; variantId?: string; quantity: number }) =>
    apiFetch("/carts/add", { method: "POST", body: JSON.stringify(data) }),
  update: (data: { cartItemId: string; quantity: number }) =>
    apiFetch("/carts/update", { method: "PUT", body: JSON.stringify(data) }),
  remove: (cartItemId: string) => apiFetch(`/carts/remove/${cartItemId}`, { method: "DELETE" }),
  clear: () => apiFetch("/carts/clear", { method: "DELETE" }),
};

// ── ORDERS ────────────────────────────────────────────────────────────────────
export interface Address { _id: string; receiverName: string; phone: string; address: string; isDefault: boolean; }
export interface Order {
  _id: string; totalPrice: number; shippingFee?: number; discountAmount?: number;
  status: "pending" | "confirmed" | "shipping" | "completed" | "cancelled";
  orderType: "normal" | "custom"; createdAt: string; address?: Address;
}
export interface OrderItem { _id: string; product?: ApiProduct; variant?: ProductVariant; price: number; quantity: number; }

export const orderApi = {
  createFromCart: (data: { addressId: string; paymentMethod?: string; voucherCode?: string }) =>
    apiFetch<{ message: string; orderId: string }>("/orders/from-cart", { method: "POST", body: JSON.stringify(data) }),
  getAll: () => apiFetch<Order[]>("/orders"),
  getById: (id: string) => apiFetch<{ order: Order; items: OrderItem[] }>(`/orders/${id}`),
  cancel: (id: string) => apiFetch(`/orders/${id}/cancel`, { method: "PUT" }),
};

// ── VOUCHER ───────────────────────────────────────────────────────────────────
export interface VoucherApplyResult {
  message: string;
  voucher: { _id: string; code: string; description: string; discountType: string; discountValue: number };
  discountAmount: number;
  finalTotal: number;
}

export const voucherApi = {
  apply: (data: { code: string; orderTotal: number }) =>
    apiFetch<VoucherApplyResult>("/vouchers/apply", { method: "POST", body: JSON.stringify(data) }),
};

// ── PAYMENT ──────────────────────────────────────────────────────────────────
// ✅ FIX routes đúng với server.js:
//   POST /api/payments/create  → COD (protected, under /api/payments)
//   GET  /api/payments/momo/:id → MoMo (protected, under /api/payments)
//   GET  /api/payments/vnpay/:id → VNPay (PUBLIC, under /api/payments/vnpay)
export const paymentApi = {
  // COD: tạo payment record, không cần redirect
  createCOD: (orderId: string) =>
    apiFetch<{ message: string }>("/payments/create", {
      method: "POST", body: JSON.stringify({ orderId, method: "cod" }),
    }),

  // VNPay: ✅ đúng route /api/payments/vnpay/:id (public route trong server.js)
  createVNPay: (orderId: string) =>
    apiFetch<{ payUrl: string }>(`/payments/vnpay/${orderId}`),

  // MoMo: ✅ đúng route /api/payments/momo/:id (protected route)
  createMomo: (orderId: string) =>
    apiFetch<{ payUrl: string }>(`/payments/momo/${orderId}`),
};

// ── REVIEWS ───────────────────────────────────────────────────────────────────
export interface Review {
  _id: string;
  user: { _id: string; displayName: string; avatarUrl?: string };
  rating: number; comment: string; createdAt: string; autoReply?: string;
}

export const reviewApi = {
  getByProduct: (productId: string) => apiFetch<Review[]>(`/reviews/${productId}`),
  create: (data: { orderId: string; productId: string; rating: number; comment: string }) =>
    apiFetch("/reviews", { method: "POST", body: JSON.stringify(data) }),
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
export const formatPrice = (p: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p);

export const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  pending:   { label: "Chờ xác nhận", color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  confirmed: { label: "Đã xác nhận",  color: "text-blue-600 bg-blue-50 border-blue-200" },
  shipping:  { label: "Đang giao",    color: "text-purple-600 bg-purple-50 border-purple-200" },
  completed: { label: "Hoàn thành",   color: "text-green-600 bg-green-50 border-green-200" },
  cancelled: { label: "Đã hủy",       color: "text-red-600 bg-red-50 border-red-200" },
};

// ── ADDRESS ───────────────────────────────────────────────────────────────────
export const addressApi = {
  getAll: () => apiFetch<Address[]>("/addresses"),
  create: (data: { receiverName: string; phone: string; address: string; isDefault?: boolean }) =>
    apiFetch<Address>("/addresses", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Address>) =>
    apiFetch<Address>(`/addresses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: string) => apiFetch(`/addresses/${id}`, { method: "DELETE" }),
};

// ── CHAT ──────────────────────────────────────────────────────────────────────
export interface ChatMessage {
  _id: string;
  chat: string;
  sender: { _id: string; displayName: string } | string;
  message: string;
  type: "text" | "image";
  createdAt: string;
}

export interface ChatSession {
  _id: string;
  customer: { _id: string; fullName: string; email: string } | string;
  status: "open" | "closed";
  createdAt: string;
  updatedAt: string;
}

export const chatApi = {
  startOrGet: () => apiFetch<{ chat: ChatSession; messages: ChatMessage[] }>("/chats/start", { method: "POST" }),
  getMessages: (chatId: string) => apiFetch<{ chat: ChatSession; messages: ChatMessage[] }>(`/chats/${chatId}/messages`),
  sendMessage: (chatId: string, message: string) =>
    apiFetch<ChatMessage>(`/chats/${chatId}/message`, { method: "POST", body: JSON.stringify({ message }) }),
};