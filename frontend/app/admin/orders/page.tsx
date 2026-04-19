"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import AdminShell from "../components/AdminShell";
import { adminOrderApi, AdminOrder, formatPrice, ORDER_STATUS } from "../../lib/adminApi";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function Badge({ status }: { status: string }) {
  const s = ORDER_STATUS[status] ?? { label: status, color: "text-gray-500 bg-gray-50 border-gray-200" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${s.color}`}>
      {s.label}
    </span>
  );
}

const PAYMENT_METHOD_LABELS: Record<string, { label: string; color: string }> = {
  cod:   { label: "COD",   color: "text-green-600 bg-green-100" },
  momo:  { label: "MoMo",  color: "text-pink-700 bg-pink-50 border border-pink-100" },
  vnpay: { label: "VNPay", color: "text-blue-700 bg-blue-50 border border-blue-100" },
};

function PaymentBadge({ method }: { method?: string | null }) {
  if (!method) return <span className="text-xs text-gray-300">—</span>;
  const m = PAYMENT_METHOD_LABELS[method] ?? { label: method, color: "text-gray-500 bg-gray-100" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${m.color}`}>
      {m.label}
    </span>
  );
}

const STATUS_TABS = [
  { value: "", label: "Tất cả" },
  { value: "pending",   label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "shipping",  label: "Đang giao" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
];

function OrdersContent() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminOrderApi.getAll({
        status: statusFilter || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });
      setOrders(res);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [statusFilter, fromDate, toDate]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Đơn hàng</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Tổng cộng <span className="font-semibold text-gray-600">{orders.length}</span> đơn hàng
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        {/* Status tabs */}
        <div className="flex gap-1 flex-wrap">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                statusFilter === tab.value
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Date filters */}
        <div className="flex items-center gap-2 sm:ml-auto">
          <div className="relative">
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="pl-3 pr-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-amber-400 text-gray-600"
            />
          </div>
          <span className="text-gray-400 text-xs">→</span>
          <div className="relative">
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="pl-3 pr-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-amber-400 text-gray-600"
            />
          </div>
          {(fromDate || toDate) && (
            <button
              onClick={() => { setFromDate(""); setToDate(""); }}
              className="px-2 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-300">
            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="2"/>
            </svg>
            <p className="mt-3 text-sm">Không có đơn hàng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Mã đơn</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Khách hàng</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Sản phẩm</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Danh mục</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tổng tiền</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Thanh toán</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ngày tạo</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(order => (
                  <tr key={order._id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-800 text-sm">{order.user?.displayName ?? "—"}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{order.user?.phone ?? ""}</p>
                    </td>
                    <td className="px-5 py-4 max-w-[180px]">
                      {order.orderItems && order.orderItems.length > 0 ? (
                        <div className="space-y-0.5">
                          {order.orderItems.slice(0, 2).map((item, i) => (
                            <p key={i} className="text-xs text-gray-700 truncate">
                              {item.product?.name ?? item.customRequest?.description ?? "Bánh custom"}
                              <span className="text-gray-400 ml-1">×{item.quantity}</span>
                            </p>
                          ))}
                          {order.orderItems.length > 2 && (
                            <p className="text-xs text-gray-400">+{order.orderItems.length - 2} sản phẩm</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {(() => {
                        if (order.orderType === "custom") {
                          return <span className="text-xs px-2.5 py-1 rounded-full font-medium text-purple-700 bg-purple-50 border border-purple-100">✦ Bánh custom</span>;
                        }
                        const cats = [...new Set(
                          (order.orderItems ?? [])
                            .map(i => i.product?.category?.name)
                            .filter(Boolean)
                        )];
                        if (cats.length === 0) return <span className="text-xs text-gray-300">—</span>;
                        return (
                          <div className="flex flex-wrap gap-1">
                            {cats.map((cat, i) => (
                              <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 font-medium">
                                {cat}
                              </span>
                            ))}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-amber-600">{formatPrice(order.totalPrice)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <Badge status={order.status} />
                    </td>
                    <td className="px-5 py-4">
                      <PaymentBadge method={order.paymentMethod} />
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-100 text-gray-600 hover:bg-amber-100 hover:text-amber-700 transition-colors"
                      >
                        Xem
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <AdminShell>
      <Suspense fallback={
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <OrdersContent />
      </Suspense>
    </AdminShell>
  );
}