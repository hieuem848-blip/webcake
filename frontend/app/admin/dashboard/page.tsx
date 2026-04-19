"use client";
import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import { adminDashboardApi, formatPrice, DashboardData, ORDER_STATUS } from "../../lib/adminApi";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAdminAuth } from "../../context/AdminAuthContext";

const PIE_COLORS = ["#f59e0b", "#3b82f6", "#8b5cf6", "#10b981", "#ef4444"];

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

function StatCard({
  label,
  value,
  icon,
  color,
  link,
  suffix,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  link: string;
  suffix?: string;
}) {
  return (
    <Link
      href={link}
      className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-800 mb-1">
        {value}
        {suffix && <span className="text-sm font-normal text-gray-400 ml-1">{suffix}</span>}
      </p>
      <p className="text-sm text-gray-500">{label}</p>
    </Link>
  );
}

function formatVND(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [monthlyRevenue, setMonthlyRevenue] = useState<{ month: string; revenue: number; orders: number }[]>([]);
  const [dailyRevenue,   setDailyRevenue]   = useState<{ day: string; revenue: number; orders: number }[]>([]);
  const [weeklyRevenue,  setWeeklyRevenue]  = useState<{ week: string; revenue: number; orders: number }[]>([]);
  const [topProducts,    setTopProducts]    = useState<{ productId: string; name: string; totalQuantity: number; totalRevenue: number }[]>([]);
  const [topCustomers,   setTopCustomers]   = useState<{ userId: string; name: string; email: string; totalOrders: number; totalSpent: number }[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const { user } = useAdminAuth();

  useEffect(() => {
    adminDashboardApi.get().then(setData).catch(console.error).finally(() => setLoading(false));
    adminDashboardApi.getTopProducts(5).then((r) => setTopProducts(r.topProducts)).catch(console.error);
    adminDashboardApi.getTopCustomers(5).then((r) => setTopCustomers(r.topCustomers)).catch(console.error);
  }, []);

  useEffect(() => {
    setChartLoading(true);
    Promise.all([
      adminDashboardApi.getMonthlyRevenue(selectedYear).then((res) => setMonthlyRevenue(res.monthly)),
      adminDashboardApi.getDailyRevenue(selectedYear, selectedMonth).then((res) => setDailyRevenue(res.daily)),
      adminDashboardApi.getWeeklyRevenue(selectedYear, selectedMonth).then((res) => setWeeklyRevenue(res.weekly)),
    ])
      .catch(console.error)
      .finally(() => setChartLoading(false));
  }, [selectedYear, selectedMonth]);

  if (loading)
    return (
      <AdminShell>
        <div className="flex items-center justify-center h-64">
          <div className="w-9 h-9 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminShell>
    );

  const cards = [
    {
      label: "Tổng khách hàng",
      value: data?.users.total ?? 0,
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      color: "#6366f1",
      link: "/admin/users",
    },
    {
      label: "Tổng đơn hàng",
      value: data?.orders.total ?? 0,
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="2"/><path d="M9 12h6M9 16h4"/>
        </svg>
      ),
      color: "#f59e0b",
      link: "/admin/orders",
    },
    {
      label: "Đơn đang xử lý",
      value: (data?.orders.pending ?? 0) + (data?.orders.confirmed ?? 0) + (data?.orders.shipping ?? 0),
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      color: "#ef4444",
      link: "/admin/orders",
      suffix: "đơn",
    },
    {
      label: "Doanh thu",
      value: formatPrice(data?.revenue.total ?? 0),
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
      color: "#10b981",
      link: "/admin/orders?status=completed",
    },
    {
      label: "Tổng sản phẩm",
      value: data?.products.total ?? 0,
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      ),
      color: "#f59e0b",
      link: user?.role === "ADMIN" ? "/admin/products" : "#",
    },
    {
      label: "Bánh Custom chờ",
      value: data?.customCakes.pending ?? 0,
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 2a3 3 0 0 1 3 3v1H9V5a3 3 0 0 1 3-3z"/>
          <path d="M4 6h16v2a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V6z"/>
          <path d="M4 14h16v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5z"/>
        </svg>
      ),
      color: "#8b5cf6",
      link: "/admin/custom-cakes?status=pending",
      suffix: "chờ xử lý",
    },
  ];

  const orderPieData = [
    { name: "Chờ xác nhận", value: data?.orders.pending ?? 0 },
    { name: "Đã xác nhận", value: data?.orders.confirmed ?? 0 },
    { name: "Đang giao", value: data?.orders.shipping ?? 0 },
    { name: "Hoàn thành", value: data?.orders.completed ?? 0 },
    { name: "Đã hủy", value: data?.orders.cancelled ?? 0 },
  ].filter(d => d.value > 0);

  const orderBarStats = [
    { label: "Chờ xác nhận", value: data?.orders.pending ?? 0, color: "#f59e0b", bg: "bg-amber-500" },
    { label: "Đã xác nhận", value: data?.orders.confirmed ?? 0, color: "#3b82f6", bg: "bg-blue-500" },
    { label: "Đang giao",    value: data?.orders.shipping ?? 0, color: "#8b5cf6", bg: "bg-purple-500" },
    { label: "Hoàn thành",  value: data?.orders.completed ?? 0, color: "#10b981", bg: "bg-emerald-500" },
    { label: "Đã hủy",      value: data?.orders.cancelled ?? 0, color: "#ef4444", bg: "bg-red-500" },
  ];

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* ── Page heading ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">Tổng quan hoạt động cửa hàng bánh kem</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 text-sm text-gray-500">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c, i) => (
            <StatCard key={i} {...c} />
          ))}
        </div>

        {/* ── Hàng 1: Doanh thu theo ngày (rộng) + Trạng thái đơn ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Biểu đồ theo ngày — chiếm 2/3 */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-800">Doanh thu theo ngày</h2>
                <p className="text-xs text-gray-400 mt-0.5">Tháng {selectedMonth}/{selectedYear}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white">
                  {["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"].map((label, i) => (
                    <option key={i + 1} value={i + 1}>{label}</option>
                  ))}
                </select>
                <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white">
                  {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            {chartLoading ? (
              <div className="flex items-center justify-center h-[220px]">
                <div className="w-6 h-6 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={dailyRevenue} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dailyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} interval={4} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={formatVND} width={36} />
                  <Tooltip formatter={(v: number) => [formatPrice(v), "Doanh thu"]} contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 11 }} />
                  <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} fill="url(#dailyGrad)" dot={false} activeDot={{ r: 4, fill: "#f59e0b" }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie chart trạng thái đơn — chiếm 1/3 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-800 mb-1">Trạng thái đơn hàng</h2>
            <p className="text-xs text-gray-400 mb-3">Phân bổ theo trạng thái</p>
            {orderPieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={orderPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                      {orderPieData.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-1">
                  {orderPieData.map((d, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                        <span className="text-gray-600">{d.name}</span>
                      </div>
                      <span className="font-semibold text-gray-800">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[220px] text-gray-300">
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                </svg>
                <p className="text-xs mt-2">Chưa có dữ liệu</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Hàng 2: Doanh thu theo tuần + Doanh thu theo tháng ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Biểu đồ theo tuần — chiếm 2/3 */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-800">Doanh thu theo tuần</h2>
                <p className="text-xs text-gray-400 mt-0.5">Tháng {selectedMonth}/{selectedYear}</p>
              </div>
            </div>
            {chartLoading ? (
              <div className="flex items-center justify-center h-[220px]">
                <div className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={weeklyRevenue} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="weeklyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={formatVND} width={36} />
                  <Tooltip formatter={(v: number) => [formatPrice(v), "Doanh thu"]} contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 11 }} />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#weeklyGrad)" dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#3b82f6" }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Biểu đồ theo tháng — chiếm 1/3, cùng chiều rộng với pie */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-800">Doanh thu theo tháng</h2>
                <p className="text-xs text-gray-400 mt-0.5">Năm {selectedYear}</p>
              </div>
            </div>
            {chartLoading ? (
              <div className="flex items-center justify-center h-[220px]">
                <div className="w-6 h-6 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlyRevenue} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="monthlyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={formatVND} width={36} />
                  <Tooltip formatter={(v: number) => [formatPrice(v), "Doanh thu"]} contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 11 }} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#monthlyGrad)" dot={false} activeDot={{ r: 4, fill: "#10b981" }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Hàng 3: Chi tiết đơn + Custom/SP + Thao tác nhanh ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Chi tiết đơn hàng - progress bars */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-800 mb-4">Chi tiết đơn hàng</h2>
            <div className="space-y-4">
              {orderBarStats.map((s, i) => {
                const pct = data?.orders.total
                  ? ((s.value / data.orders.total) * 100).toFixed(1)
                  : "0";
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-gray-600">{s.label}</span>
                      <span className="font-semibold text-gray-800">{s.value}
                        <span className="text-xs font-normal text-gray-400 ml-1">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: s.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bánh Custom + Sản phẩm */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-gray-800">Bánh Custom</h2>
                <Link href="/admin/custom-cakes" className="text-xs text-amber-500 font-medium hover:underline">Xem tất cả →</Link>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Chờ xử lý", value: data?.customCakes.pending, color: "text-amber-600", bg: "bg-amber-50" },
                  { label: "Đã báo giá", value: data?.customCakes.quoted, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Hoàn thành", value: data?.customCakes.completed, color: "text-emerald-600", bg: "bg-emerald-50" },
                ].map((item, i) => (
                  <div key={i} className={`${item.bg} rounded-xl p-3 text-center`}>
                    <p className={`text-xl font-bold ${item.color}`}>{item.value ?? 0}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-tight">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-gray-800">Sản phẩm</h2>
                <Link href="/admin/products" className="text-xs text-amber-500 font-medium hover:underline">Xem tất cả →</Link>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Tổng cộng", value: data?.products.total, color: "text-amber-600", bg: "bg-amber-50" },
                  { label: "Đang bán",  value: data?.products.active, color: "text-emerald-600", bg: "bg-emerald-50" },
                  { label: "Customizable", value: data?.products.customizable, color: "text-purple-600", bg: "bg-purple-50" },
                ].map((item, i) => (
                  <div key={i} className={`${item.bg} rounded-xl p-3 text-center`}>
                    <p className={`text-xl font-bold ${item.color}`}>{item.value ?? 0}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-tight">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Thao tác nhanh */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-800 mb-4">Thao tác nhanh</h2>
            <div className="space-y-2">
              {[
                {
                  href: "/admin/products/new", label: "Thêm sản phẩm mới", roles: ["ADMIN"],
                  icon: (<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>),
                  color: "text-amber-600 bg-amber-50 hover:bg-amber-100",
                },
                {
                  href: "/admin/orders?status=pending", label: "Đơn chờ xác nhận", roles: ["ADMIN", "STAFF"],
                  icon: (<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>),
                  color: "text-orange-600 bg-orange-50 hover:bg-orange-100",
                },
                {
                  href: "/admin/custom-cakes?status=pending", label: "Custom chờ xử lý", roles: ["ADMIN", "STAFF"],
                  icon: (<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 1 3 3v1H9V5a3 3 0 0 1 3-3z"/><path d="M4 14h16v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5z"/></svg>),
                  color: "text-purple-600 bg-purple-50 hover:bg-purple-100",
                },
                {
                  href: "/admin/users", label: "Danh sách khách hàng", roles: ["ADMIN"],
                  icon: (<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>),
                  color: "text-indigo-600 bg-indigo-50 hover:bg-indigo-100",
                },
                {
                  href: "/admin/categories", label: "Quản lý danh mục", roles: ["ADMIN"],
                  icon: (<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>),
                  color: "text-teal-600 bg-teal-50 hover:bg-teal-100",
                },
              ]
                .filter(item => item.roles.includes(user?.role))
                .map(({ href, label, icon, color }) => (
                  <Link key={href} href={href} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${color}`}>
                    {icon}{label}
                  </Link>
                ))}
            </div>
          </div>

        </div>
        
        {/* ── Hàng cuối: Top sản phẩm + Top khách hàng ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Top sản phẩm bán chạy */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-800">Sản phẩm bán chạy</h2>
                <p className="text-xs text-gray-400 mt-0.5">Dựa trên đơn hàng đã hoàn thành</p>
              </div>
            </div>
            {topProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-300">
                <p className="text-xs">Chưa có dữ liệu</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-800 pb-3 pr-4">Vị trí</th>
                      <th className="text-left text-xs font-semibold text-gray-800 pb-3 pr-4">Sản phẩm</th>
                      <th className="text-left text-xs font-semibold text-gray-800 pb-3 pr-4">Số lượng</th>
                      <th className="text-left text-xs font-semibold text-gray-800 pb-3 pr-4">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {topProducts.map((p, i) => (
                      <tr key={p.productId}>
                        <td className="py-3 pr-4">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            i === 0 ? "bg-yellow-100 text-yellow-400"
                            : i === 1 ? "bg-gray-100 text-gray-500"
                            : i === 2 ? "bg-orange-100 text-orange-500"
                            : "bg-gray-50 text-gray-500"
                          }`}>{i + 1}</span>
                        </td>
                        <td className="py-3">
                          <p className="font-medium text-gray-800 truncate max-w-[180px]">{p.name}</p>
                        </td>
                        <td className="py-3 pr-4 text-left">
                          <span className="font-semibold text-gray-700">{p.totalQuantity.toLocaleString()}</span>
                          <span className="text-xs text-gray-400 ml-1">sản phẩm</span>
                        </td>
                        <td className="py-3 text-left">
                          <span className="font-semibold text-amber-600">{formatPrice(p.totalRevenue)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Top khách hàng */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-800">Khách hàng nổi bật</h2>
                <p className="text-xs text-gray-400 mt-0.5">Khách hàng mua nhiều nhất</p>
              </div>
            </div>
            {topCustomers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-300">
                <p className="text-xs">Chưa có dữ liệu</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-800 pb-3 pr-4">Vị trí</th>
                      <th className="text-left text-xs font-semibold text-gray-800 pb-3 pl-4">Khách hàng</th>
                      <th className="text-left text-xs font-semibold text-gray-800 pb-3 pr-4">Tổng đơn</th>
                      <th className="text-left text-xs font-semibold text-gray-800 pb-3 pr-4">Tổng chi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {topCustomers.map((c, i) => (
                      <tr key={c.userId}>
                        <td className="py-3 pr-4">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            i === 0 ? "bg-yellow-100 text-yellow-400"
                            : i === 1 ? "bg-gray-100 text-gray-500"
                            : i === 2 ? "bg-orange-100 text-orange-500"
                            : "bg-gray-50 text-gray-500"
                          }`}>{i + 1}</span>
                        </td>
                        <td className="py-3 pl-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={c.name} />
                            <div>
                              <p className="font-semibold text-gray-800 truncate max-w-[130px]">
                                {c.name}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[130px]">
                                {c.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-1 text-left">
                          <span className="font-semibold text-gray-700">{c.totalOrders}</span>
                          <span className="text-xs text-gray-400 ml-1">đơn</span>
                        </td>
                        <td className="py-3 text-left">
                          <span className="font-semibold text-emerald-600">{formatPrice(c.totalSpent)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>
    </AdminShell>
  );
}