"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle2, Package, ChevronRight, AlertCircle } from "lucide-react";
import { userApi, formatPrice, ORDER_STATUS, type User as UserType, type Order } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";

export default function ProfilePage() {
  const { user, loading: authLoading, refresh } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<{ user: UserType; recentOrders: Order[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"info" | "password">("info");

  const [form, setForm] = useState({ fullName: "", oldPassword: "", newPassword: "", confirmPassword: "" });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/auth/login?redirect=/profile"); return; }
    userApi.getProfile().then((data) => {
      setProfile(data);
      setForm((f) => ({ ...f, fullName: data.user.displayName || "" }));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user, authLoading, router]);

  const handleSave = async () => {
    setError(""); setSuccess("");
    if (tab === "password") {
      if (!form.oldPassword || !form.newPassword) { setError("Vui lòng điền đầy đủ"); return; }
      if (form.newPassword !== form.confirmPassword) { setError("Mật khẩu mới không khớp"); return; }
      if (form.newPassword.length < 6) { setError("Mật khẩu tối thiểu 6 ký tự"); return; }
    }
    setSaving(true);
    try {
      await userApi.updateProfile(tab === "password"
        ? { oldPassword: form.oldPassword, newPassword: form.newPassword }
        : { fullName: form.fullName });
      setSuccess(tab === "password" ? "Đổi mật khẩu thành công!" : "Cập nhật thông tin thành công!");
      if (tab === "info") await refresh();
      if (tab === "password") setForm((f) => ({ ...f, oldPassword: "", newPassword: "", confirmPassword: "" }));
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#C8A96A] border-t-transparent rounded-full animate-spin" />
    </main>
  );

  const u = profile?.user || user!;

  return (
    <main className="min-h-screen page-fade" style={{ background: "var(--background)" }}>
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "var(--font-heading)" }}>Tài khoản của tôi</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left card */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <div className="w-20 h-20 rounded-full bg-[#C8A96A]/10 border-2 border-[#C8A96A]/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl font-bold text-[#C8A96A]">{u.displayName?.[0]?.toUpperCase() || "U"}</span>
            </div>
            <p className="font-bold text-gray-800 text-lg">{u.displayName}</p>
            <p className="text-xs text-gray-400 mt-0.5">{u.email}</p>
            <span className={`inline-block mt-2 text-xs px-2.5 py-0.5 rounded-full font-medium ${u.role === "ADMIN" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
              {u.role}
            </span>
          </div>

          {/* Nav */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {[
              { href: "/profile", label: "Thông tin tài khoản", icon: <User size={15} /> },
              { href: "/orders", label: "Đơn hàng của tôi", icon: <Package size={15} /> },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 px-5 py-3.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-[#C8A96A] transition border-b border-gray-50 last:border-0">
                <span className="text-[#C8A96A]">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit form */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex gap-6 border-b border-gray-100 mb-6">
              {[{ id: "info", label: "Thông tin" }, { id: "password", label: "Đổi mật khẩu" }].map((t) => (
                <button key={t.id} onClick={() => { setTab(t.id as typeof tab); setError(""); setSuccess(""); }}
                  className={`pb-3 text-sm font-medium border-b-2 -mb-px transition ${tab === t.id ? "border-[#C8A96A] text-[#C8A96A]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {success && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-600 text-sm rounded-xl px-4 py-3 mb-4">
                <CheckCircle2 size={16} /> {success}
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {tab === "info" ? (
              <div className="space-y-4">
                {[
                  { key: "displayName", label: "Họ tên", icon: <User size={14} />, value: u.displayName, editable: false },
                  { key: "email", label: "Email", icon: <Mail size={14} />, value: u.email, editable: false },
                  { key: "phone", label: "Số điện thoại", icon: <Phone size={14} />, value: u.phone, editable: false },
                  { key: "username", label: "Tên đăng nhập", icon: <User size={14} />, value: u.username, editable: false },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
                    <div className="flex items-center border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50">
                      <span className="text-[#C8A96A] mr-3">{f.icon}</span>
                      <span className="text-sm text-gray-700">{f.value || "—"}</span>
                    </div>
                  </div>
                ))}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Họ tên hiển thị</label>
                  <div className="flex items-center border border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-[#C8A96A] transition">
                    <User size={14} className="text-[#C8A96A] mr-3" />
                    <input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                      className="w-full bg-transparent outline-none text-sm text-gray-800" placeholder="Tên hiển thị" />
                  </div>
                </div>
                <button onClick={handleSave} disabled={saving}
                  className="btn-gold px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 flex items-center gap-2">
                  {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  Lưu thay đổi
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { key: "oldPassword", label: "Mật khẩu hiện tại", show: showOld, toggle: () => setShowOld(!showOld) },
                  { key: "newPassword", label: "Mật khẩu mới", show: showNew, toggle: () => setShowNew(!showNew) },
                  { key: "confirmPassword", label: "Xác nhận mật khẩu mới", show: showNew, toggle: () => setShowNew(!showNew) },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
                    <div className="flex items-center border border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-[#C8A96A] transition">
                      <Lock size={14} className="text-[#C8A96A] mr-3 shrink-0" />
                      <input type={f.show ? "text" : "password"}
                        value={(form as Record<string, string>)[f.key]}
                        onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
                        placeholder={f.label} />
                      <button type="button" onClick={f.toggle} className="text-gray-400 ml-2">
                        {f.show ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
                <button onClick={handleSave} disabled={saving}
                  className="btn-gold px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 flex items-center gap-2">
                  {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  Đổi mật khẩu
                </button>
              </div>
            )}
          </div>

          {/* Recent orders */}
          {profile?.recentOrders && profile.recentOrders.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Đơn hàng gần đây</h3>
                <Link href="/orders" className="text-xs text-[#C8A96A] hover:underline flex items-center gap-1">
                  Xem tất cả <ChevronRight size={12} />
                </Link>
              </div>
              <div className="space-y-3">
                {profile.recentOrders.map((order) => {
                  const st = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
                  return (
                    <Link key={order._id} href={`/orders/${order._id}`}
                      className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:text-[#C8A96A] transition group">
                      <div>
                        <p className="text-xs font-mono text-gray-500">#{order._id.slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${st.color}`}>{st.label}</span>
                        <span className="text-sm font-bold text-gray-700">{formatPrice(order.totalPrice)}</span>
                        <ChevronRight size={14} className="text-gray-300 group-hover:text-[#C8A96A]" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
