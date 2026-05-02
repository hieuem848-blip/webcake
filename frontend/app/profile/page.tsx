"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle2, Package, ChevronRight, AlertCircle, ChevronLeft, LogOut } from "lucide-react";
import { userApi, formatPrice, ORDER_STATUS, type User as UserType, type Order } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";

export default function ProfilePage() {
  const { user, loading: authLoading, refresh, openLoginModal, signOut } = useAuth();
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
    if (!user) { openLoginModal(); return; }
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
    <main className="w-full bg-[#F7F6F3]">
      {/* DARK HEADER */}
      <div className="bg-[#1c1d21]">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#A79F91]">Tài khoản của tôi</h1>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-[#C8A96A] hover:underline font-medium"
          >
            <ChevronLeft size={13} /> Trang chủ
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* AVATAR */}
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[#C8A96A]/10 border-2 border-[#C8A96A]/30 flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl font-bold text-[#C8A96A]">{u.displayName?.[0]?.toUpperCase() || "U"}</span>
                </div>
                <p className="font-bold text-gray-800 text-lg">{u.displayName}</p>
                <p className="text-xs text-gray-400 mt-0.5">{u.email}</p>
                <span className={`inline-block mt-2 text-xs px-2.5 py-0.5 rounded-full font-medium ${u.role === "ADMIN" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                  {u.role}
                </span>
              </div>

              <div className="px-6 pb-4 border-b border-gray-100">
                <button
                  onClick={async () => { await signOut(); router.push("/"); }}
                  className="w-full flex items-center justify-center gap-2  rounded-xl border border-red-200 text-sm font-medium text-red-500 hover:bg-red-50 transition"
                >
                  <LogOut size={15} />
                  Đăng xuất
                </button>
              </div>

              {/* NAV */}
              <div className="px-5 pt-4 pb-2 text-xs font-bold text-gray-800 uppercase tracking-wider">
                Thao tác nhanh
              </div>
              {[
                { href: "/profile", label: "Thông tin tài khoản", icon: <User size={15} /> },
                { href: "/orders",  label: "Đơn hàng của tôi",    icon: <Package size={15} /> },
              ].map((item) => (
                <Link key={item.href} href={item.href}
                  className="flex items-center justify-between px-5 py-3.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-[#C8A96A] transition border-b border-gray-50 group">
                  <div className="flex items-center gap-3">
                    <span className="text-[#C8A96A]">{item.icon}</span>
                    {item.label}
                  </div>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-[#C8A96A] transition" />
                </Link>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-2 space-y-5">

            {/* EDIT FORM */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* TAB HEADER */}
              <div className="flex border-b border-gray-100 px-6">
                {[{ id: "info", label: "Thông tin" }, { id: "password", label: "Đổi mật khẩu" }].map((t) => (
                  <button key={t.id}
                    onClick={() => { setTab(t.id as typeof tab); setError(""); setSuccess(""); }}
                    className={`py-4 mr-6 text-sm font-medium border-b-2 -mb-px transition
                      ${tab === t.id ? "border-[#C8A96A] text-[#C8A96A]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="p-6 space-y-4">
                {success && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-600 text-sm rounded-xl px-4 py-3">
                    <CheckCircle2 size={16} /> {success}
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}

                {tab === "info" ? (
                  <>
                    {/* THÔNG TIN CHỈ ĐỌC */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { label: "Họ tên",         icon: <User size={14} />,  value: u.displayName },
                        { label: "Email",           icon: <Mail size={14} />,  value: u.email       },
                        { label: "Số điện thoại",  icon: <Phone size={14} />, value: u.phone       },
                        { label: "Tên đăng nhập",  icon: <User size={14} />,  value: u.username    },
                      ].map((f) => (
                        <div key={f.label}>
                          <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
                          <div className="flex items-center border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50">
                            <span className="text-[#C8A96A] mr-3">{f.icon}</span>
                            <span className="text-sm text-gray-700">{f.value || "—"}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* TÊN HIỂN THỊ — có thể sửa */}
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Tên hiển thị</label>
                      <div className="flex items-center border border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-[#C8A96A] transition">
                        <User size={14} className="text-[#C8A96A] mr-3 shrink-0" />
                        <input value={form.fullName}
                          onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                          className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
                          placeholder="Tên hiển thị" />
                      </div>
                    </div>

                    <button onClick={handleSave} disabled={saving}
                      className="btn-gold px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 flex items-center gap-2">
                      {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      Lưu thay đổi
                    </button>
                  </>
                ) : (
                  <>
                    {[
                      { key: "oldPassword",     label: "Mật khẩu hiện tại",      show: showOld, toggle: () => setShowOld(!showOld) },
                      { key: "newPassword",     label: "Mật khẩu mới",            show: showNew, toggle: () => setShowNew(!showNew) },
                      { key: "confirmPassword", label: "Xác nhận mật khẩu mới",   show: showNew, toggle: () => setShowNew(!showNew) },
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
                      {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      Đổi mật khẩu
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* ĐƠN HÀNG GẦN ĐÂY */}
            {profile?.recentOrders && profile.recentOrders.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Package size={16} className="text-[#C8A96A]" /> Đơn hàng gần đây
                  </h3>
                  <Link href="/orders" className="text-xs text-[#C8A96A] hover:underline flex items-center gap-1 font-medium">
                    Xem tất cả <ChevronRight size={12} />
                  </Link>
                </div>

                {/* TABLE HEADER */}
                <div className="grid grid-cols-12 px-6 py-3 text-xs font-semibold text-gray-500 border-b border-gray-100 bg-gray-50">
                  <div className="col-span-4">Mã đơn</div>
                  <div className="col-span-3 text-center">Ngày đặt</div>
                  <div className="col-span-3 text-center">Trạng thái</div>
                  <div className="col-span-2 text-center ml-6">Tổng tiền</div>
                </div>

                {profile.recentOrders.map((order) => {
                  const st = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
                  return (
                    <Link key={order._id} href={`/orders/${order._id}`}
                      className="grid grid-cols-12 items-center px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition group">
                      <div className="col-span-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package size={14} className="text-[#C8A96A]" />
                        </div>
                        <span className="text-xs font-mono text-gray-600">#{order._id.slice(-8).toUpperCase()}</span>
                      </div>
                      <div className="col-span-3 text-center text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                      <div className="col-span-3 flex justify-center">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${st.color}`}>{st.label}</span>
                      </div>
                      <div className="col-span-2 flex items-center justify-end gap-1">
                        <span className="text-sm font-bold text-[#C8A96A]">{formatPrice(order.totalPrice)}</span>
                        <ChevronRight size={13} className="text-gray-300 group-hover:text-[#C8A96A] transition" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}