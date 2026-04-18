"use client";
import { useEffect, useState } from "react";
import AdminShell from "../../components/AdminShell";
import { adminOrderApi, AdminOrderDetail, formatPrice, ORDER_STATUS } from "../../../lib/adminApi";
import Link from "next/link";

const STATUS_FLOW = ["pending", "confirmed", "shipping", "completed"];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState("");
  const [detail, setDetail] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancel, setShowCancel] = useState(false);

  useEffect(() => {
    params.then(p => {
      setId(p.id);
      adminOrderApi.getById(p.id).then(setDetail).catch(console.error).finally(() => setLoading(false));
    });
  }, [params]);

  const handleUpdateStatus = async (status: string) => {
    if (!confirm(`Chuyển trạng thái sang "${ORDER_STATUS[status]?.label}"?`)) return;
    setUpdating(true);
    try {
      await adminOrderApi.updateStatus(id, status);
      const updated = await adminOrderApi.getById(id);
      setDetail(updated);
    } catch (e: unknown) { alert(e instanceof Error ? e.message : "Lỗi"); }
    finally { setUpdating(false); }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await adminOrderApi.cancel(id, cancelReason || "Admin hủy đơn");
      const updated = await adminOrderApi.getById(id);
      setDetail(updated);
      setShowCancel(false);
    } catch (e: unknown) { alert(e instanceof Error ? e.message : "Lỗi"); }
    finally { setCancelling(false); }
  };

  if (loading) return (
    <AdminShell>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#C8A96A", borderTopColor: "transparent" }} />
      </div>
    </AdminShell>
  );

  if (!detail) return <AdminShell><div className="text-center py-16 text-gray-400">Không tìm thấy đơn hàng</div></AdminShell>;

  const { order, items } = detail;
  const st = ORDER_STATUS[order.status] ?? { label: order.status, color: "text-gray-500 bg-gray-50 border-gray-200" };
  const currentIdx = STATUS_FLOW.indexOf(order.status);
  const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;

  return (
    <AdminShell>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders" className="text-sm" style={{ color: "#C8A96A" }}>← Đơn hàng</Link>
          <span style={{ color: "#ccc" }}>/</span>
          <h1 className="text-xl font-bold" style={{ fontFamily: "Georgia, serif", color: "#1a1a1a" }}>
            Đơn #{order._id.slice(-8).toUpperCase()}
          </h1>
          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${st.color}`}>
            {st.label}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: items + address */}
          <div className="lg:col-span-2 space-y-5">
            {/* Items */}
            <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: "#e8ddd0" }}>
              <h2 className="font-semibold mb-4" style={{ color: "#1a1a1a" }}>Sản phẩm đặt</h2>
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item._id} className="flex items-start justify-between py-3 border-b last:border-0" style={{ borderColor: "#f0e8dc" }}>
                    <div className="flex-1">
                      <p className="font-medium text-sm" style={{ color: "#1a1a1a" }}>
                        {item.product?.name ?? "Sản phẩm đã xóa"}
                      </p>
                      {item.variant && (
                        <p className="text-xs mt-0.5" style={{ color: "#aaa" }}>Size: {item.variant.size}</p>
                      )}
                      <p className="text-xs mt-0.5" style={{ color: "#888" }}>x{item.quantity}</p>
                    </div>
                    <p className="font-semibold text-sm" style={{ color: "#C8A96A" }}>{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t" style={{ borderColor: "#f0e8dc" }}>
                <span className="font-semibold" style={{ color: "#1a1a1a" }}>Tổng cộng</span>
                <span className="text-lg font-bold" style={{ color: "#C8A96A" }}>{formatPrice(order.totalPrice)}</span>
              </div>
            </div>

            {/* Address */}
            {order.address && (
              <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: "#e8ddd0" }}>
                <h2 className="font-semibold mb-3" style={{ color: "#1a1a1a" }}>Địa chỉ giao hàng</h2>
                <p className="font-medium text-sm" style={{ color: "#333" }}>{order.address.receiverName}</p>
                <p className="text-sm mt-1" style={{ color: "#666" }}>{order.address.phone}</p>
                <p className="text-sm mt-1" style={{ color: "#666" }}>{order.address.address}</p>
              </div>
            )}
          </div>

          {/* Right: customer + actions */}
          <div className="space-y-5">
            {/* Customer */}
            <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: "#e8ddd0" }}>
              <h2 className="font-semibold mb-3" style={{ color: "#1a1a1a" }}>Khách hàng</h2>
              <div className="space-y-2 text-sm">
                <p style={{ color: "#333" }}><strong>Tên:</strong> {order.user?.displayName ?? "—"}</p>
                <p style={{ color: "#333" }}><strong>Email:</strong> {order.user?.email ?? "—"}</p>
                <p style={{ color: "#333" }}><strong>SĐT:</strong> {order.user?.phone ?? "—"}</p>
                <p style={{ color: "#888" }}><strong>Ngày đặt:</strong> {new Date(order.createdAt).toLocaleString("vi-VN")}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl p-6 border space-y-3" style={{ borderColor: "#e8ddd0" }}>
              <h2 className="font-semibold" style={{ color: "#1a1a1a" }}>Cập nhật trạng thái</h2>

              {/* Progress bar */}
              <div className="flex items-center gap-1 mb-3">
                {STATUS_FLOW.map((s, i) => (
                  <div key={s} className="flex items-center flex-1">
                    <div className={`w-full h-1.5 rounded-full ${i <= currentIdx ? "" : ""}`}
                      style={{ background: i <= currentIdx ? "#C8A96A" : "#f0e8dc" }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs mb-3" style={{ color: "#aaa" }}>
                {STATUS_FLOW.map(s => (
                  <span key={s} style={{ color: order.status === s ? "#C8A96A" : "#aaa", fontWeight: order.status === s ? 600 : 400 }}>
                    {ORDER_STATUS[s]?.label?.split(" ")[0]}
                  </span>
                ))}
              </div>

              {nextStatus && order.status !== "cancelled" && (
                <button onClick={() => handleUpdateStatus(nextStatus)} disabled={updating}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: "#C8A96A" }}>
                  {updating ? "Đang cập nhật..." : `→ ${ORDER_STATUS[nextStatus]?.label}`}
                </button>
              )}

              {order.status !== "cancelled" && order.status !== "completed" && (
                <button onClick={() => setShowCancel(true)}
                  className="w-full py-2.5 rounded-xl text-sm font-medium border"
                  style={{ borderColor: "#fca5a5", color: "#dc2626" }}>
                  Hủy đơn hàng
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel modal */}
      {showCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="font-bold mb-3" style={{ fontFamily: "Georgia, serif", color: "#1a1a1a" }}>Hủy đơn hàng</h2>
            <textarea rows={3} placeholder="Lý do hủy (tùy chọn)..."
              value={cancelReason} onChange={e => setCancelReason(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm resize-none mb-4"
              style={{ borderColor: "#e0d0b8", background: "#fdf9f4" }} />
            <div className="flex gap-3">
              <button onClick={handleCancel} disabled={cancelling}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: "#ef4444" }}>
                {cancelling ? "Đang hủy..." : "Xác nhận hủy"}
              </button>
              <button onClick={() => setShowCancel(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border"
                style={{ borderColor: "#e0d0b8", color: "#666" }}>Thoát</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
