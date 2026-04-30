"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, ChevronLeft, ChevronRight, ShoppingBag, AlertCircle } from "lucide-react";
import { orderApi, formatPrice, ORDER_STATUS, type Order } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";

export default function OrdersPage() {
  const { user, loading: authLoading, openLoginModal } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { openLoginModal(); return; }
    orderApi.getAll().then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, [user, authLoading, router]);

  // 🔒 Chưa login
  if (!authLoading && !user)
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-5 page-fade">
        <div className="text-center">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-[#C8A96A]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Vui lòng đăng nhập</h1>
          <p className="text-gray-400 text-sm mb-6">Đăng nhập để xem đơn hàng của bạn</p>
          <button
            onClick={openLoginModal}
            className="btn-gold inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm"
          >
            Đăng nhập
          </button>
        </div>
      </main>
    );

  // ⏳ Loading
  if (authLoading || loading)
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#C8A96A] border-t-transparent rounded-full animate-spin" />
      </main>
    );

  // 📦 Không có đơn hàng
  if (orders.length === 0)
    return (
      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 bg-gray-100">
        <div className="text-center max-w-sm w-full">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={32} className="text-[#C8A96A]" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Chưa có đơn hàng nào</h1>
          <p className="text-gray-400 text-sm mb-6">Hãy khám phá và đặt những chiếc bánh thơm ngon!</p>
          <Link
            href="/products"
            className="btn-gold inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm w-full"
          >
            <ShoppingBag size={16} />
            Khám phá sản phẩm
          </Link>
        </div>
      </main>
    );

  // Tính tổng tiền tất cả đơn
  const totalSpent = orders.filter(o => ["completed", "delivered"].includes(o.status)).reduce((sum, o) => sum + o.totalPrice, 0);
  const pendingCount = orders.filter(o => o.status === "pending" || o.status === "confirmed").length;
  const cancelledCount = orders.filter(o => o.status === "cancelled").length;
  const completedCount = orders.filter(o => o.status === "completed").length;

  return (
    <main className="w-full bg-gray-100">
      {/* HEADER */}
      <div className="bg-[#1c1d21]">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#A79F91]">Đơn hàng của tôi</h1>
            <p className="text-sm text-[#A79F91] mt-0.5">{orders.length} đơn hàng</p>
          </div>
          <Link
            href="/profile"
            className="flex items-center gap-1.5 text-sm text-[#C8A96A] hover:underline font-medium"
          >
            <ChevronLeft size={13} /> Tài khoản
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT — danh sách đơn hàng */}
          <div className="lg:col-span-2 space-y-4">

            {/* HEADER TABLE */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="grid grid-cols-12 px-6 py-4 text-sm font-semibold text-gray-500 border-b border-gray-200">
                <div className="col-span-5">Đơn hàng</div>
                <div className="col-span-3 text-center">Ngày đặt</div>
                <div className="col-span-2 text-center">Trạng thái</div>
                <div className="col-span-2 text-center">Tổng tiền</div>
              </div>

              {orders.map((order) => {
                const st = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
                return (
                  <Link
                    key={order._id}
                    href={`/orders/${order._id}`}
                    className="grid grid-cols-12 gap-4 items-center px-6 py-5 hover:bg-gray-50 transition group border-b border-gray-50 last:border-0"
                  >
                    {/* ORDER INFO */}
                    <div className="col-span-5 flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Package size={20} className="text-[#C8A96A]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 font-mono">
                          #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {order.orderType === "custom" ? "Bánh đặt" : "Đơn thường"}
                        </p>
                      </div>
                    </div>

                    {/* DATE */}
                    <div className="col-span-3 text-center text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </div>

                    {/* STATUS */}
                    <div className="col-span-2 flex justify-center">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${st.color}`}>
                        {st.label}
                      </span>
                    </div>

                    {/* TOTAL + ARROW */}
                    <div className="col-span-2 flex items-center justify-end gap-1">
                      <span className="text-base font-bold text-[#C8A96A]">
                        {formatPrice(order.totalPrice)}
                      </span>
                      <ChevronRight size={15} className="text-gray-300 group-hover:text-[#C8A96A] transition flex-shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* RIGHT — tóm tắt */}
          <div className="h-full">
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-gray-800">Tổng quan</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tổng đơn hàng</span>
                  <span className="font-semibold text-gray-800">{orders.length}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Đang xử lý</span>
                  <span className="font-semibold text-amber-500">{pendingCount}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Đã hủy</span>
                  <span className="font-semibold text-red-500">{cancelledCount}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Đã hoàn thành</span>
                  <span className="font-semibold text-green-500">{completedCount}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-800">
                  <span>Tổng đã chi</span>
                  <span className="text-[#C8A96A] text-lg">{formatPrice(totalSpent)}</span>
                </div>
              </div>

              <Link
                href="/products"
                className="w-full btn-gold py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              >
                <ShoppingBag size={16} />
                Mua thêm bánh
              </Link>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}