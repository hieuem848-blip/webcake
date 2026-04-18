"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, AlertCircle, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../context/AdminAuthContext";

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setLoading(true);
    try {
      await login(form.email, form.password);
      router.replace("/admin/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Email hoặc mật khẩu không đúng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f3efe9]">
      
      {/* LEFT - IMAGE / BRAND */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-[#1c1a17] text-white overflow-hidden">
        
        {/* Background image */}
        <img
          src="/cake.jpg"
          alt="admin"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Content */}
        <div className="relative z-10 text-center px-10">
          <p className="text-sm tracking-widest uppercase text-gray-300 mb-3">
            Witchy Bakery
          </p>
          <h1 className="text-4xl font-serif mb-4">
            Admin Dashboard
          </h1>
          <p className="text-gray-300 text-sm max-w-sm mx-auto">
            Quản lý đơn hàng, khách hàng và hoạt động cửa hàng một cách hiệu quả.
          </p>
        </div>
      </div>

      {/* RIGHT - LOGIN FORM */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl px-8 py-10">
          
          <p className="text-gray-400 text-sm tracking-widest uppercase mb-2">
            Witchy Bakery Admin
          </p>
          <h1 className="text-3xl font-serif text-gray-800 mb-2">
            Đăng nhập quản trị
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Chỉ dành cho quản trị viên hệ thống
          </p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block font-medium">
                Email
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 focus-within:border-[#C8A96A] focus-within:ring-1 focus-within:ring-[#C8A96A]/30 transition">
                <Mail size={16} className="text-[#c8a46b] mr-3 shrink-0" />
                <input
                  type="email"
                  placeholder="admin@gmail.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-transparent outline-none text-gray-800 text-sm placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block font-medium">
                Mật khẩu
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 focus-within:border-[#C8A96A] focus-within:ring-1 focus-within:ring-[#C8A96A]/30 transition">
                <Lock size={16} className="text-[#c8a46b] mr-3 shrink-0" />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-transparent outline-none text-gray-800 text-sm placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input type="checkbox" className="accent-[#c8a46b] rounded" />
                Ghi nhớ đăng nhập
              </label>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1c1a17] text-white py-3.5 rounded-xl font-semibold tracking-wide hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                "ĐĂNG NHẬP"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}