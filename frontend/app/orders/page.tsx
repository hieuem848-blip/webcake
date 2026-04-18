"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, ChevronRight, ShoppingBag } from "lucide-react";
import { orderApi, formatPrice, ORDER_STATUS, type Order } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/auth/login?redirect=/orders"); return; }
    orderApi.getAll().then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || loading) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#C8A96A] border-t-transparent rounded-full animate-spin" />
    </main>
  );

  return (
    <main className="min-h-screen page-fade" style={{ background: "var(--background)" }}>
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "var(--font-heading)" }}>
            Đơn hàng của tôi
          </h1>
          <p className="text-sm text-gray-400 mt-1">{orders.length} đơn hàng</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <ShoppingBag size={32} className="text-[#C8A96A]" />
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Chưa có đơn hàng nào</h2>
            <p className="text-gray-400 text-sm mb-6">Hãy khám phá và đặt những chiếc bánh thơm ngon!</p>
            <Link href="/products" className="btn-gold px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
              <ShoppingBag size={15} /> Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const st = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
              return (
                <Link key={order._id} href={`/orders/${order._id}`}
                  className="block bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                        <Package size={18} className="text-[#C8A96A]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-mono">#{order._id.slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" })}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${st.color}`}>{st.label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-400 mr-2">
                        {order.orderType === "custom" ? "🎨 Bánh tùy chỉnh" : "🎂 Đơn thường"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-[#C8A96A]">{formatPrice(order.totalPrice)}</span>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-[#C8A96A] transition" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
