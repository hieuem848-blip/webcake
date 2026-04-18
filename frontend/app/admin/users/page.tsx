"use client";
import { useEffect, useState, useCallback } from "react";
import AdminShell from "../components/AdminShell";
import { adminUserApi, AdminUserItem } from "../../lib/adminApi";
import Link from "next/link";

function Avatar({ name }: { name: string }) {
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
      style={{ background: "linear-gradient(135deg, #f59e0b, #b45309)" }}
    >
      {name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminUserApi.getAll({ page, limit: 10, keyword });
      setUsers(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, keyword]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleToggle = async (id: string) => {
    setToggling(id);
    try { await adminUserApi.toggleStatus(id); loadUsers(); }
    catch (e: unknown) { alert(e instanceof Error ? e.message : "Lỗi"); }
    finally { setToggling(null); }
  };

  return (
    <AdminShell>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Khách hàng</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Tổng cộng <span className="font-semibold text-gray-600">{total}</span> người dùng
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="relative max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={keyword}
              onChange={e => { setKeyword(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-300">
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              </svg>
              <p className="mt-3 text-sm">Không có người dùng nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Người dùng</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">SĐT</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vai trò</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ngày đăng ký</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(user => (
                    <tr key={user._id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.displayName} />
                          <div>
                            <p className="font-semibold text-gray-800">{user.displayName}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{user.phone || "—"}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                          user.role === "ADMIN"
                            ? "text-red-700 bg-red-50 border-red-100"
                            : user.role === "STAFF"
                            ? "text-blue-700 bg-blue-50 border-blue-100"
                            : "text-gray-600 bg-gray-100 border-gray-200"
                        }`}>
                          {user.role ?? "USER"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          user.status === "active"
                            ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                            : "text-red-600 bg-red-50 border-red-100"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === "active" ? "bg-emerald-500" : "bg-red-500"}`} />
                          {user.status === "active" ? "Hoạt động" : "Đã khóa"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/users/${user._id}`}
                            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-100 text-gray-600 hover:bg-amber-100 hover:text-amber-700 transition-colors"
                          >
                            Chi tiết
                          </Link>
                          <button
                            onClick={() => handleToggle(user._id)}
                            disabled={toggling === user._id}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors disabled:opacity-50 ${
                              user.status === "active"
                                ? "border-red-100 text-red-600 hover:bg-red-50"
                                : "border-emerald-100 text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            {toggling === user._id ? "..." : user.status === "active" ? "Khóa" : "Mở khóa"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? "bg-amber-500 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
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
    </AdminShell>
  );
}
