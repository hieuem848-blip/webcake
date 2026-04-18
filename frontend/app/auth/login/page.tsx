"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, AlertCircle, User } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [form, setForm] = useState({ username: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.username || !form.password) { setError("Vui lòng nhập đầy đủ thông tin"); return; }
    setLoading(true);
    try {
      await signIn(form.username, form.password);
      router.push(redirect);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-[#f3efe9] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl px-8 py-10">
        <p className="text-gray-400 text-sm tracking-widest uppercase mb-2">Witchy Bakery</p>
        <h1 className="text-3xl font-serif text-gray-800 mb-2">Chào bạn trở lại.</h1>
        <p className="text-sm text-gray-500 mb-8">
          Chưa có tài khoản?{" "}
          <Link href="/auth/register" className="text-[#c8a46b] hover:underline font-medium">Tạo tài khoản</Link>
        </p>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block font-medium">Tên đăng nhập</label>
            <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 focus-within:border-[#C8A96A] focus-within:ring-1 focus-within:ring-[#C8A96A]/30 transition">
              <User size={16} className="text-[#c8a46b] mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full bg-transparent outline-none text-gray-800 text-sm placeholder:text-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block font-medium">Mật khẩu</label>
            <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 focus-within:border-[#C8A96A] focus-within:ring-1 focus-within:ring-[#C8A96A]/30 transition">
              <Lock size={16} className="text-[#c8a46b] mr-3 shrink-0" />
              <input
                type={showPw ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-transparent outline-none text-gray-800 text-sm placeholder:text-gray-400"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-400 hover:text-gray-600 ml-2">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
              <input type="checkbox" className="accent-[#c8a46b] rounded" />
              Ghi nhớ đăng nhập
            </label>
            <Link href="/auth/forgot-password" className="text-[#c8a46b] hover:underline">Quên mật khẩu?</Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1c1a17] text-white py-3.5 rounded-xl font-semibold tracking-wide hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang đăng nhập...</>
            ) : "ĐĂNG NHẬP"}
          </button>
        </form>
      </div>
    </div>
  );
}
