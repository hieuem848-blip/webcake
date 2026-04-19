"use client";
import { useEffect, useState, useCallback } from "react";
import AdminShell from "../components/AdminShell";
import { adminProductApi, adminCategoryApi, AdminProduct, AdminCategory, formatPrice } from "../../lib/adminApi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../context/AdminAuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5001";

function resolveImgUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_BASE}${url}`;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminProduct | null>(null);
  const { user } = useAdminAuth();

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminProductApi.getAll({ page, limit: 10, keyword, category: categoryFilter || undefined });
      setProducts(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, keyword, categoryFilter]);

  useEffect(() => {
    adminCategoryApi.getAll({ limit: 100 }).then(r => setCategories(r.categories)).catch(() => {});
  }, []);
  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleHide = async (id: string) => {
    if (!confirm("Ẩn sản phẩm này? (Sản phẩm sẽ không hiển thị nhưng không bị xóa)")) return;
    setActionId(id);
    try { await adminProductApi.hide(id); loadProducts(); }
    catch (e: unknown) { alert(e instanceof Error ? e.message : "Lỗi"); }
    finally { setActionId(null); }
  };

  const handleHardDelete = async (product: AdminProduct) => {
    setConfirmDelete(product);
  };

  const confirmHardDelete = async () => {
    if (!confirmDelete) return;
    setActionId(confirmDelete._id);
    setConfirmDelete(null);
    try { await adminProductApi.delete(confirmDelete._id); loadProducts(); }
    catch (e: unknown) { alert(e instanceof Error ? e.message : "Lỗi"); }
    finally { setActionId(null); }
  };

  const getCategoryName = (cat: AdminProduct["category"]) => {
    if (typeof cat === "string") return categories.find(c => c._id === cat)?.name ?? cat;
    return cat?.name ?? "";
  };

  return (
    <AdminShell>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Sản phẩm</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Tổng cộng <span className="font-semibold text-gray-600">{total}</span> sản phẩm
            </p>
          </div>
          {user?.role === "ADMIN" && (
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm shadow-amber-200 hover:shadow-amber-300 hover:-translate-y-0.5 transition-all"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Thêm sản phẩm
          </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={keyword}
              onChange={e => { setKeyword(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-amber-400 text-gray-700 bg-white"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-300">
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <p className="mt-3 text-sm">Không có sản phẩm nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ảnh</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Sản phẩm</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Danh mục</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Giá gốc</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Custom</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map(p => {
                    const imgUrl = (p as AdminProduct & { images?: { imageUrl: string; isMain: boolean }[] })
                      .images?.find(i => i.isMain)?.imageUrl
                      || (p as AdminProduct & { images?: { imageUrl: string }[] }).images?.[0]?.imageUrl
                      || "";
                    return (
                      <tr key={p._id} className={`hover:bg-amber-50/40 transition-colors ${actionId === p._id ? "opacity-50" : ""}`}>
                        <td className="px-5 py-3">
                          {imgUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={resolveImgUrl(imgUrl)}
                              alt={p.name}
                              className="w-12 h-12 object-cover rounded-xl border border-gray-100"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-300">
                              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21 15 16 10 5 21"/>
                              </svg>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-semibold text-gray-800">{p.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{p.description}</p>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 font-medium">
                            {getCategoryName(p.category)}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="font-bold text-amber-600">{formatPrice(p.basePrice)}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                            p.status === "active"
                              ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                              : "text-gray-500 bg-gray-50 border-gray-200"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${p.status === "active" ? "bg-emerald-500" : "bg-gray-400"}`} />
                            {p.status === "active" ? "Đang bán" : "Đã ẩn"}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {p.isCustomizable ? (
                            <span className="text-xs px-2.5 py-1 rounded-full text-purple-700 bg-purple-50 border border-purple-100 font-medium">
                              ✦ Custom
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1.5">

                            {/* ADMIN ONLY: Edit */}
                            {user?.role === "ADMIN" && (
                              <button
                                onClick={() => router.push(`/admin/products/${p._id}`)}
                                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-100 text-gray-600 hover:bg-amber-100 hover:text-amber-700 transition-colors"
                              >
                                Sửa
                              </button>
                            )}

                            {/* BOTH: Hide / Show */}
                            {p.status === "active" ? (
                              <button
                                onClick={() => handleHide(p._id)}
                                disabled={actionId === p._id}
                                className="px-3 py-1.5 rounded-xl text-xs font-medium border border-orange-100 text-orange-500 hover:bg-orange-50 transition-colors disabled:opacity-40"
                              >
                                Ẩn
                              </button>
                            ) : (
                              <button
                                onClick={async () => {
                                  setActionId(p._id);
                                  try {
                                    await adminProductApi.show(p._id);
                                    loadProducts();
                                  } catch (e: unknown) {
                                    alert(e instanceof Error ? e.message : "Lỗi");
                                  } finally {
                                    setActionId(null);
                                  }
                                }}
                                disabled={actionId === p._id}
                                className="px-3 py-1.5 rounded-xl text-xs font-medium border border-emerald-100 text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-40"
                              >
                                Hiện
                              </button>
                            )}

                            {/* ADMIN ONLY: Delete */}
                            {user?.role === "ADMIN" && (
                              <button
                                onClick={() => handleHardDelete(p)}
                                disabled={actionId === p._id}
                                className="px-3 py-1.5 rounded-xl text-xs font-medium border border-red-100 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                              >
                                Xóa
                              </button>
                            )}

                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-5 py-3">
            <p className="text-sm text-gray-400">
              Trang <span className="font-medium text-gray-700">{page}</span> / {totalPages}
            </p>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50 text-gray-600 transition-colors"
              >
                ← Trước
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50 text-gray-600 transition-colors"
              >
                Tiếp →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Hard Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/>
                  <path d="M9 6V4h6v2"/>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Xóa vĩnh viễn?</h3>
                <p className="text-xs text-gray-400 mt-0.5">Hành động này không thể hoàn tác</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Bạn sắp xóa hẳn sản phẩm <span className="font-semibold text-gray-800">&quot;{confirmDelete.name}&quot;</span> cùng toàn bộ ảnh và biến thể liên quan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmHardDelete}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Xóa hẳn
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
