"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Package, MapPin, CreditCard, AlertTriangle, Clock, CheckCircle2, Truck, Star, XCircle } from "lucide-react";
import { orderApi, formatPrice, ORDER_STATUS, type Order, type OrderItem } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";

const STEPS = [
  { key: "pending",   label: "Chờ xác nhận", icon: Clock,         active: "bg-yellow-400 text-white",   line: "bg-yellow-300" },
  { key: "confirmed", label: "Đã xác nhận",  icon: CheckCircle2,  active: "bg-blue-500 text-white",     line: "bg-blue-300"   },
  { key: "shipping",  label: "Đang giao",    icon: Truck,         active: "bg-purple-500 text-white",   line: "bg-purple-300" },
  { key: "completed", label: "Hoàn thành",   icon: Star,          active: "bg-green-500 text-white",    line: "bg-green-300"  },
];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading, openLoginModal } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { openLoginModal(); return; }
    orderApi.getById(id)
      .then(({ order: o, items: it }) => { setOrder(o); setItems(it); })
      .catch(() => {})
      .finally(() => setLoading(false));
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
  const currentStep = STEPS.findIndex(s => s.key === order.status);

  // Tính subtotal ngược từ totalPrice nếu backend không trả shippingFee
  const shippingFee = order.shippingFee ?? 0;
  const discountAmount = order.discountAmount ?? 0;
  const subTotal = order.totalPrice - shippingFee + discountAmount;

  return (
    <main className="w-full bg-gray-100">
      {/* DARK HEADER */}
      <div className="bg-[#1c1d21]">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#A79F91]">Chi tiết đơn hàng</h1>
              <p className="text-sm text-[#A79F91] mt-0.5 font-mono">#{order._id.slice(-10).toUpperCase()}</p>
            </div>
            <Link
            href="/orders"
            className="flex items-center gap-1.5 text-sm text-[#C8A96A] hover:underline font-medium"
          >
            <ChevronLeft size={13} /> Đơn hàng
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-5">

            {/* PROGRESS — bình thường */}
            {order.status !== "cancelled" && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center">
                  {STEPS.map((step, i) => {
                    const Icon = step.icon;
                    const done = i <= currentStep;
                    const lineActive = i < currentStep;
                    return (
                      <div key={step.key} className="flex-1 flex items-center">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition
                            ${done ? step.active : "bg-gray-100 text-gray-300"}`}>
                            <Icon size={18} />
                          </div>
                          <p className={`text-xs mt-2 text-center whitespace-nowrap font-medium
                            ${done ? "text-gray-700" : "text-gray-300"}`}>
                            {step.label}
                          </p>
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className={`flex-1 h-1 mx-2 mb-5 rounded-full transition
                            ${lineActive ? step.line : "bg-gray-100"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PROGRESS — đã hủy */}
            {order.status === "cancelled" && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <XCircle size={24} className="text-red-500" />
                </div>
                <div>
                  <p className="font-semibold text-red-600">Đơn hàng đã bị hủy</p>
                  <p className="text-sm text-red-400 mt-0.5">Đơn hàng này đã được hủy và không thể khôi phục</p>
                </div>
              </div>
            )}

            {/* ITEMS TABLE */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <Package size={16} className="text-[#C8A96A]" />
                <h2 className="font-bold text-gray-800">Sản phẩm đặt mua</h2>
              </div>
              <div className="grid grid-cols-12 px-6 py-3 text-sm font-semibold text-gray-500 border-b border-gray-100 bg-gray-50">
                <div className="col-span-6">Sản phẩm</div>
                <div className="col-span-2 text-center">Đơn giá</div>
                <div className="col-span-2 text-center">Số lượng</div>
                <div className="col-span-2 text-right">Thành tiền</div>
              </div>
              {items.map((item) => (
                <div key={item._id} className="grid grid-cols-12 items-center px-6 py-4 border-b border-gray-50 last:border-0">
                  <div className="col-span-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package size={16} className="text-[#C8A96A]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{item.product?.name || "Bánh tùy chỉnh"}</p>
                      {item.variant && (
                        <p className="text-xs text-gray-400 mt-0.5">{item.variant.size} · {item.variant.serving} người</p>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 text-center text-sm text-[#C8A96A] font-bold">{formatPrice(item.price)}</div>
                  <div className="col-span-2 text-center text-sm text-gray-600 font-medium">×{item.quantity}</div>
                  <div className="col-span-2 text-right text-sm font-bold text-gray-800">{formatPrice(order.totalPrice)}


                    
                  </div>
                </div>
              ))}
            </div>

            {/* HỦY ĐƠN */}
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

          {/* RIGHT */}
          <div className="space-y-5">

            {/* TÓM TẮT & PHÍ SHIP */}
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <CreditCard size={16} className="text-[#C8A96A]" /> Tóm tắt đơn hàng
              </h2>
              <div className="space-y-2 text-sm">
                {[
                  { label: "Mã đơn hàng",  value: `#${order._id.slice(-10).toUpperCase()}` },
                  { label: "Ngày đặt",      value: new Date(order.createdAt).toLocaleString("vi-VN") },
                  { label: "Loại đơn",      value: order.orderType === "custom" ? "Bánh đặt" : "Đơn thường" },
                  { label: "Trạng thái",    value: st.label },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-gray-400">{r.label}</span>
                    <span className="font-medium text-gray-700 text-right max-w-[55%]">{r.value}</span>
                  </div>
                ))}
              </div>

              {/* CHI TIẾT GIÁ */}
              <div className="border-t border-gray-100 pt-4 space-y-4 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Tạm tính</span>
                  <span className="font-medium text-gray-700">{formatPrice(subTotal)}</span>
                </div>

                <div className="flex justify-between text-gray-500">
                  <span>Phí giao hàng</span>
                  {shippingFee === 0
                    ? <span className="font-medium text-green-500">Miễn phí</span>
                    : <span className="font-medium text-gray-700">{formatPrice(shippingFee)}</span>
                  }
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Giảm giá</span>
                    <span className="font-medium text-green-600">−{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-gray-100">
                  <span>Tổng cộng</span>
                  <span className="text-[#C8A96A] text-lg">{formatPrice(order.totalPrice)}</span>
                </div>

              </div>
            </div>

            {/* ĐỊA CHỈ GIAO HÀNG */}
            {order.address && (
              <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <MapPin size={16} className="text-[#C8A96A]" /> Địa chỉ giao hàng
                </h2>
                <div className="space-y-2.5 text-sm pt-1">
                  {[
                    { label: "Tên",             value: order.address.receiverName },
                    { label: "Số điện thoại",   value: order.address.phone        },
                    { label: "Địa chỉ",         value: order.address.address      },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
                      <span className="text-gray-400 flex-shrink-0">{label}</span>
                      <span className="font-semibold text-gray-800 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}