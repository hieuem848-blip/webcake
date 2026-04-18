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

  useEffect(() => {
    params.then(p => {
      setId(p.id);
      adminUserApi.getById(p.id).then(d => {
        setDetail(d as unknown as UserDetail);
        setNewRole(d.user.role ?? "USER");
      }).catch(console.error).finally(() => setLoading(false));
    });
  }, [params]);

  const handleToggle = async () => {
    setToggling(true);
    try {
      await adminUserApi.toggleStatus(id);
      const d = await adminUserApi.getById(id);
      setDetail(d as unknown as UserDetail);
    } catch (e: unknown) { alert(e instanceof Error ? e.message : "Lỗi"); }
    finally { setToggling(false); }
  };

  const handleAssignRole = async () => {
    setAssigning(true);
    try {
      await adminUserApi.assignRole(id, newRole);
      const d = await adminUserApi.getById(id);
      setDetail(d as unknown as UserDetail);
      alert("Đã cập nhật role!");
    } catch (e: unknown) { alert(e instanceof Error ? e.message : "Lỗi"); }
    finally { setAssigning(false); }
  };

  if (loading) return (
    <AdminShell>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#C8A96A", borderTopColor: "transparent" }} />
      </div>
    </AdminShell>
  );

  if (!detail) return <AdminShell><div className="text-center py-16 text-gray-400">Không tìm thấy người dùng</div></AdminShell>;

  const { user, orders, totalSpent } = detail;

  return (
    <AdminShell>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/users" className="text-sm" style={{ color: "#C8A96A" }}>← Khách hàng</Link>
          <span style={{ color: "#ccc" }}>/</span>
          <h1 className="text-xl font-bold" style={{ fontFamily: "Georgia, serif", color: "#1a1a1a" }}>Chi tiết người dùng</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 border text-center" style={{ borderColor: "#e8ddd0" }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3"
                style={{ background: "#C8A96A" }}>
                {user.displayName?.charAt(0) || "?"}
              </div>
              <h2 className="font-bold" style={{ color: "#1a1a1a" }}>{user.displayName}</h2>
              <p className="text-sm mt-0.5" style={{ color: "#888" }}>{user.email}</p>
              <div className="mt-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.status === "active" ? "text-green-700 bg-green-50 border-green-200" : "text-red-600 bg-red-50 border-red-200"}`}>
                  {user.status === "active" ? "Hoạt động" : "Đã khóa"}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border space-y-3" style={{ borderColor: "#e8ddd0" }}>
              <h3 className="font-semibold text-sm" style={{ color: "#1a1a1a" }}>Thông tin</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span style={{ color: "#888" }}>SĐT</span><span style={{ color: "#333" }}>{user.phone || "—"}</span></div>
                <div className="flex justify-between"><span style={{ color: "#888" }}>Vai trò</span><span style={{ color: "#333" }}>{user.role}</span></div>
                <div className="flex justify-between"><span style={{ color: "#888" }}>Tham gia</span><span style={{ color: "#333" }}>{new Date(user.createdAt).toLocaleDateString("vi-VN")}</span></div>
                <div className="flex justify-between"><span style={{ color: "#888" }}>Tổng chi</span><span className="font-semibold" style={{ color: "#C8A96A" }}>{formatPrice(totalSpent)}</span></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border space-y-3" style={{ borderColor: "#e8ddd0" }}>
              <h3 className="font-semibold text-sm" style={{ color: "#1a1a1a" }}>Phân quyền</h3>
              <select value={newRole} onChange={e => setNewRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                style={{ borderColor: "#e0d0b8", background: "#fdf9f4", color: "#333" }}>
                <option value="USER">USER</option>
                <option value="STAFF">STAFF</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <button onClick={handleAssignRole} disabled={assigning}
                className="w-full py-2 rounded-xl text-sm font-medium text-white disabled:opacity-60"
                style={{ background: "#C8A96A" }}>
                {assigning ? "Đang lưu..." : "Cập nhật role"}
              </button>
              <button onClick={handleToggle} disabled={toggling}
                className={`w-full py-2 rounded-xl text-sm font-medium border disabled:opacity-60 ${user.status === "active" ? "border-red-200 text-red-600 hover:bg-red-50" : "border-green-200 text-green-700 hover:bg-green-50"}`}>
                {toggling ? "..." : user.status === "active" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
              </button>
            </div>
          </div>

          {/* Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#e8ddd0" }}>
              <div className="px-6 py-4 border-b" style={{ borderColor: "#f0e8dc" }}>
                <h2 className="font-semibold" style={{ color: "#1a1a1a" }}>Lịch sử đơn hàng ({orders.length})</h2>
              </div>
              {orders.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">Chưa có đơn hàng nào</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "#fdf6ec", borderBottom: "1px solid #e8ddd0" }}>
                      <th className="text-left px-4 py-3 font-semibold" style={{ color: "#5a4a35" }}>Mã đơn</th>
                      <th className="text-left px-4 py-3 font-semibold" style={{ color: "#5a4a35" }}>Ngày</th>
                      <th className="text-left px-4 py-3 font-semibold" style={{ color: "#5a4a35" }}>Tổng tiền</th>
                      <th className="text-left px-4 py-3 font-semibold" style={{ color: "#5a4a35" }}>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, i) => {
                      const st = ORDER_STATUS[order.status] ?? { label: order.status, color: "text-gray-500 bg-gray-50 border-gray-200" };
                      return (
                        <tr key={order._id} style={{ borderBottom: i < orders.length - 1 ? "1px solid #f0e8dc" : "none" }}
                          className="hover:bg-amber-50/30 transition-colors">
                          <td className="px-4 py-3">
                            <Link href={`/admin/orders/${order._id}`} className="font-mono text-xs hover:underline" style={{ color: "#C8A96A" }}>
                              #{order._id.slice(-8).toUpperCase()}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: "#888" }}>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</td>
                          <td className="px-4 py-3 font-medium" style={{ color: "#C8A96A" }}>{formatPrice(order.totalPrice)}</td>
                          <td className="px-4 py-3">
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
