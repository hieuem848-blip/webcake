"use client";
import { useEffect, useState } from "react";
import AdminShell from "../../components/AdminShell";
import { adminUserApi, formatPrice, ORDER_STATUS } from "../../../lib/adminApi";
import Link from "next/link";

interface UserDetail {
  user: { _id: string; displayName: string; email: string; phone: string; status: string; role: string; createdAt: string; avatarUrl?: string };
  role: string;
  orders: { _id: string; totalPrice: number; status: string; createdAt: string }[];
  totalSpent: number;
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState("");
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [roleSuccess, setRoleSuccess] = useState(false);

  useEffect(() => {
    params.then(p => {
      setId(p.id);
      adminUserApi.getById(p.id).then(d => {
        setDetail(d as unknown as UserDetail);
        setNewRole(d.user.role ?? "USER");
      }).catch(console.error).finally(() => setLoading(false));
    });
  }, [params]);

  const reload = async () => { const d = await adminUserApi.getById(id); setDetail(d as unknown as UserDetail); };

  const handleToggle = async () => {
    setToggling(true);
    try { await adminUserApi.toggleStatus(id); await reload(); }
    catch (e: unknown) { alert(e instanceof Error ? e.message : "Lỗi"); } finally { setToggling(false); }
  };

  const handleAssignRole = async () => {
    setAssigning(true);
    try { await adminUserApi.assignRole(id, newRole); await reload(); setRoleSuccess(true); setTimeout(() => setRoleSuccess(false), 2500); }
    catch (e: unknown) { alert(e instanceof Error ? e.message : "Lỗi"); } finally { setAssigning(false); }
  };

  if (loading) return <AdminShell><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div></AdminShell>;
  if (!detail) return <AdminShell><div className="text-center py-16 text-gray-400">Không tìm thấy người dùng</div></AdminShell>;

  const { user, orders, totalSpent } = detail;

  return (
    <AdminShell>
      <div className="w-full space-y-4">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link href="/admin/users" className="text-amber-500 hover:text-amber-600 transition-colors">← Khách hàng</Link>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-gray-700">{user.displayName}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left — Profile + Actions */}
          <div className="space-y-4">

            {/* Profile card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3">
                {user.displayName?.charAt(0) ?? "?"}
              </div>
              <h2 className="font-bold text-gray-800">{user.displayName}</h2>
              <p className="text-sm text-gray-400 mt-0.5">{user.email}</p>
              <div className="mt-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.status === "active" ? "text-green-700 bg-green-50 border-green-200" : "text-red-600 bg-red-50 border-red-200"}`}>
                  {user.status === "active" ? "Hoạt động" : "Đã khóa"}
                </span>
              </div>
            </div>

            {/* Thông tin */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-2.5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Thông tin</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">SĐT</span><span className="text-gray-700">{user.phone || "—"}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Vai trò</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 font-medium">{user.role}</span>
                </div>
                <div className="flex justify-between"><span className="text-gray-400">Tham gia</span><span className="text-gray-700">{new Date(user.createdAt).toLocaleDateString("vi-VN")}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Tổng đơn</span><span className="text-gray-700">{orders.length} đơn</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Tổng chi</span><span className="font-bold text-amber-600">{formatPrice(totalSpent)}</span></div>
              </div>
            </div>

            {/* Phân quyền */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phân quyền</h3>
              <select value={newRole} onChange={e => setNewRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-amber-400 bg-gray-50 text-gray-700">
                <option value="USER">USER</option>
                <option value="STAFF">STAFF</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              {roleSuccess && <p className="text-xs text-green-600 text-center">✓ Đã cập nhật role</p>}
              <button onClick={handleAssignRole} disabled={assigning}
                className="w-full py-2 rounded-xl text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-60 transition-colors">
                {assigning ? "Đang lưu..." : "Cập nhật role"}
              </button>
            </div>
          </div>

          {/* Right — Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Lịch sử đơn hàng</h2>
                <span className="text-xs text-gray-400">{orders.length} đơn</span>
              </div>
              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                  <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                    <rect x="9" y="3" width="6" height="4" rx="2"/>
                  </svg>
                  <p className="mt-2 text-sm">Chưa có đơn hàng nào</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Mã đơn</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ngày</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tổng tiền</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map(order => {
                      const st = ORDER_STATUS[order.status] ?? { label: order.status, color: "text-gray-500 bg-gray-50 border-gray-200" };
                      return (
                        <tr key={order._id} className="hover:bg-amber-50/30 transition-colors">
                          <td className="px-5 py-3.5">
                            <Link href={`/admin/orders/${order._id}`} className="font-mono text-xs font-semibold text-amber-500 hover:text-amber-600 hover:underline">
                              #{order._id.slice(-8).toUpperCase()}
                            </Link>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</td>
                          <td className="px-5 py-3.5 font-semibold text-amber-600">{formatPrice(order.totalPrice)}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${st.color}`}>{st.label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
} 