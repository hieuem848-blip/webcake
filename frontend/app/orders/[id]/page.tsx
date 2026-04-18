"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Package, MapPin, CreditCard, AlertTriangle } from "lucide-react";
import { orderApi, formatPrice, ORDER_STATUS, type Order, type OrderItem } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/auth/login?redirect=/orders"); return; }
    orderApi.getById(id).then(({ order: o, items: it }) => { setOrder(o); setItems(it); }).catch(() => {}).finally(() => setLoading(false));
  }, [id, user, authLoading, router]);

  const handleCancel = async () => {
    if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
    setCancelling(true);
    try {
      await orderApi.cancel(id);
      setOrder((o) => o ? { ...o, status: "cancelled" } : o);
    } finally {
      setCancelling(false);
    }
  };

  if (authLoading || loading) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#C8A96A] border-t-transparent rounded-full animate-spin" />
    </main>
  );

  if (!order) return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Package size={40} className="text-gray-300" />
      <p className="text-gray-500">Không tìm thấy đơn hàng</p>
      <Link href="/orders" className="text-[#C8A96A] text-sm hover:underline">← Quay lại danh sách</Link>
    </main>
  );

  const st = ORDER_STATUS[order.status] || ORDER_STATUS.pending;

  const steps = ["pending", "confirmed", "shipping", "completed"];
  const currentStep = steps.indexOf(order.status);

  return (
    <main className="min-h-screen page-fade" style={{ background: "var(--background)" }}>
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/orders" className="text-gray-400 hover:text-[#C8A96A] transition"><ChevronLeft size={20} /></Link>
          <div>
            <h1 className="font-bold text-gray-800">Chi tiết đơn hàng</h1>
            <p className="text-xs text-gray-400 font-mono">#{order._id.slice(-10).toUpperCase()}</p>
          </div>
          <span className={`ml-auto text-xs font-semibold px-3 py-1 rounded-full border ${st.color}`}>{st.label}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Progress steps */}
        {order.status !== "cancelled" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center">
              {steps.map((step, i) => (
                <div key={step} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${i <= currentStep ? "bg-[#C8A96A] text-white" : "bg-gray-100 text-gray-400"}`}>
                      {i <= currentStep ? "✓" : i + 1}
                    </div>
                    <p className={`text-xs mt-1.5 text-center ${i <= currentStep ? "text-[#C8A96A] font-medium" : "text-gray-400"}`}>
                      {ORDER_STATUS[step]?.label || step}
                    </p>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 transition ${i < currentStep ? "bg-[#C8A96A]" : "bg-gray-100"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Package size={16} className="text-[#C8A96A]" /> Sản phẩm đặt mua</h2>
          <div className="divide-y divide-gray-50">
            {items.map((item) => (
              <div key={item._id} className="py-3 flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{item.product?.name || "Bánh tùy chỉnh"}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatPrice(item.price)} × {item.quantity}</p>
                </div>
                <span className="text-sm font-bold text-gray-700">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-4 mt-2 flex justify-between font-bold text-gray-800">
            <span>Tổng cộng</span>
            <span className="text-[#C8A96A] text-lg">{formatPrice(order.totalPrice)}</span>
          </div>
        </div>

        {/* Address */}
        {order.address && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><MapPin size={16} className="text-[#C8A96A]" /> Địa chỉ giao hàng</h2>
            <p className="text-sm font-medium text-gray-800">{order.address.receiverName}</p>
            <p className="text-sm text-gray-500 mt-0.5">{order.address.phone}</p>
            <p className="text-sm text-gray-500 mt-0.5">{order.address.address}</p>
          </div>
        )}

        {/* Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><CreditCard size={16} className="text-[#C8A96A]" /> Thông tin đơn hàng</h2>
          <div className="space-y-2 text-sm">
            {[
              { label: "Mã đơn hàng", value: `#${order._id.slice(-10).toUpperCase()}` },
              { label: "Ngày đặt", value: new Date(order.createdAt).toLocaleString("vi-VN") },
              { label: "Loại đơn", value: order.orderType === "custom" ? "Bánh tùy chỉnh" : "Đơn thường" },
              { label: "Trạng thái", value: st.label },
            ].map((r) => (
              <div key={r.label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-gray-400">{r.label}</span>
                <span className="font-medium text-gray-700">{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cancel */}
        {order.status === "pending" && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-red-600">
              <AlertTriangle size={16} />
              <span>Bạn có thể hủy đơn khi chưa được xác nhận</span>
            </div>
            <button onClick={handleCancel} disabled={cancelling}
              className="text-sm font-semibold text-red-500 hover:text-red-700 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-100 transition disabled:opacity-60">
              {cancelling ? "Đang hủy..." : "Hủy đơn"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
