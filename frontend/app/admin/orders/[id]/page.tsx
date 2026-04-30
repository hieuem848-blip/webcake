"use client";
import { useEffect, useState } from "react";
import AdminShell from "../../components/AdminShell";
import { adminOrderApi, AdminOrderDetail, formatPrice, ORDER_STATUS } from "../../../lib/adminApi";
import Link from "next/link";

const STATUS_FLOW = ["pending", "confirmed", "shipping", "completed"];
const PAYMENT_LABEL: Record<string, string> = { cod: "COD", momo: "MoMo", vnpay: "VNPay" };
const STATUS_COLOR_MAP: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  shipping: "#8b5cf6",
  completed: "#10b981",
};
const STATUS_BTN_COLOR: Record<string, string> = {
  pending: "bg-amber-500 hover:bg-amber-600",
  confirmed: "bg-blue-500 hover:bg-blue-600",
  shipping: "bg-purple-500 hover:bg-purple-600",
  completed: "bg-green-500 hover:bg-green-600",
};

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
    try { await adminOrderApi.updateStatus(id, status); setDetail(await adminOrderApi.getById(id)); }
    catch (e: unknown) { alert(e instanceof Error ? e.message : "Lỗi"); } finally { setUpdating(false); }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try { await adminOrderApi.cancel(id, cancelReason || "Admin hủy đơn"); setDetail(await adminOrderApi.getById(id)); setShowCancel(false); }
    catch (e: unknown) { alert(e instanceof Error ? e.message : "Lỗi"); } finally { setCancelling(false); }
  };

  if (loading) return <AdminShell><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div></AdminShell>;
  if (!detail) return <AdminShell><div className="text-center py-16 text-gray-400">Không tìm thấy đơn hàng</div></AdminShell>;

  const { order, items } = detail;
  const st = ORDER_STATUS[order.status] ?? { label: order.status, color: "text-gray-500 bg-gray-50 border-gray-200" };
  const currentIdx = STATUS_FLOW.indexOf(order.status);
  const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;

  // Tính subtotal từ các items
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = order.discountAmount ?? 0;
  const shippingFee = (order as any).shippingFee ?? 0;
  const discount = (order as any).discount ?? 0;

  return (
    <AdminShell>
      <div className="w-full space-y-4">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link href="/admin/orders" className="text-gray-500 hover:text-gray-600 transition-colors">← Đơn hàng</Link>
          <span className="text-gray-300">/</span>
          <span className="font-mono font-semibold text-gray-700">#{order._id.slice(-8).toUpperCase()}</span>
          <span className={`ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${st.color}`}>{st.label}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left */}
          <div className="lg:col-span-2 space-y-5">

            {/* Sản phẩm */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Tóm tắt đơn hàng</h2>
              <div className="space-y-1">
                {items.map(item => (
                  <div key={item._id} className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-800">{item.product?.name ?? "Sản phẩm đã xóa"}</p>
                      {item.variant && <p className="text-xs text-gray-400 mt-0.5">Size: {item.variant.size} · {item.variant.serving}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">{formatPrice(item.price)}/cái x{item.quantity}</p>
                    </div>
                    <p className="font-semibold text-sm text-gray-600 ml-4">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Bảng tính tiền */}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-9.5">
                {/* Thành tiền */}
                <div className="flex justify-between items-center text-lg font-bold text-amber-600 pt-2">
                  <span className="font-semibold text-gray-800">Thành tiền</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {/* Phí giao hàng */}
                <div className="flex justify-between items-center text-sm pt-2">
                  <span className="font-semibold text-gray-600">Phí giao hàng</span>
                  {shippingFee > 0
                    ? <span>{formatPrice(shippingFee)}</span>
                    : <span className="text-green-600 font-medium">Miễn phí</span>
                  }
                </div>

                {/* Giảm giá */}
                <div className="flex justify-between items-center text-sm text-gray-600 pt-2">
                  <span className="font-semibold text-gray-600">Giảm giá</span>
                  <span className="font-medium text-green-600">−{formatPrice(discountAmount)}</span>
                </div>

                {/* Phương thức thanh toán */}
                <div className="flex justify-between items-center text-sm text-gray-600 pt-2">
                  <span className="font-semibold text-gray-600">Thanh toán</span>
                  <span className="font-medium text-gray-800">
                    {PAYMENT_LABEL[(order as any).paymentMethod ?? ""] ?? "—"}
                  </span>
                </div>

                {/* Tổng cộng */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="font-semibold text-gray-700">Tổng cộng</span>
                  <span className="text-lg font-bold text-amber-600">{formatPrice(order.totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-5">

            {/* Khách hàng */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Khách hàng
              </h2>

              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  <span className="font-semibold text-gray-800">Tên:</span>{" "}
                  {order.user?.displayName ?? "—"}
                </p>

                <p>
                  <span className="font-semibold text-gray-800">Email:</span>{" "}
                  {order.user?.email ?? "—"}
                </p>

                <p>
                  <span className="font-semibold text-gray-800">SĐT:</span>{" "}
                  {order.user?.phone ?? "—"}
                </p>

                {order.address && (
                  <p>
                    <span className="font-semibold text-gray-800">Địa chỉ:</span>{" "}
                    {order.address.address}
                  </p>
                )}

                <p>
                  <span className="font-semibold text-gray-800">Ngày đặt:</span>{" "}
                  {new Date(order.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
            </div>

            {/* Cập nhật trạng thái */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Cập nhật trạng thái</h2>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex gap-1">
                  {STATUS_FLOW.map((s, i) => (
                    <div
                      key={s}
                      className="flex-1 h-1.5 rounded-full transition-all"
                      style={{
                        background:
                          i <= currentIdx
                            ? STATUS_COLOR_MAP[s] || "#f59e0b"
                            : "#e5e7eb",
                      }}
                    />
                  ))}
                </div>
                <div className="flex gap-1 text-center">
                  {STATUS_FLOW.map(s => (
                    <span
                      key={s}
                      className="flex-1 text-sm font-semibold"
                      style={{
                        color:
                          order.status === s
                            ? STATUS_COLOR_MAP[s] || "#f59e0b"
                            : "#9ca3af",
                      }}
                    >
                      {ORDER_STATUS[s]?.label}
                    </span>
                  ))}
                </div>
              </div>

              {nextStatus && order.status !== "cancelled" && (
                <button
                  onClick={() => handleUpdateStatus(nextStatus)}
                  disabled={updating}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60
                    ${STATUS_BTN_COLOR[nextStatus] || "bg-gray-400"}
                  `}
                >
                  {updating ? "Đang cập nhật..." : `→ ${ORDER_STATUS[nextStatus]?.label}`}
                </button>
              )}

              {order.status !== "cancelled" && order.status !== "completed" && (
                <button onClick={() => setShowCancel(true)}
                  className="w-full py-2.5 rounded-xl text-sm font-medium border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                  Hủy đơn hàng
                </button>
              )}

              {order.status === "cancelled" && (
                <div className="text-xs text-center text-red-400 bg-red-50 rounded-xl py-2.5 border border-red-100">Đơn hàng đã bị hủy</div>
              )}
              {order.status === "completed" && (
                <div className="text-xs text-center text-green-600 bg-green-50 rounded-xl py-2.5 border border-green-100">Đơn hàng hoàn thành</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal hủy */}
      {showCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="font-bold text-gray-800 mb-3">Hủy đơn hàng</h2>
            <textarea rows={3} placeholder="Lý do hủy (tùy chọn)..." value={cancelReason} onChange={e => setCancelReason(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm resize-none mb-4 focus:border-amber-400 bg-gray-50" />
            <div className="flex gap-3">
              <button onClick={handleCancel} disabled={cancelling}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 transition-colors">
                {cancelling ? "Đang hủy..." : "Xác nhận hủy"}
              </button>
              <button onClick={() => setShowCancel(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">Thoát</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}