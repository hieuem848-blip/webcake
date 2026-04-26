"use client";

import { ArrowLeft, Mail, X } from "lucide-react";

// ─── Props khi dùng dạng modal (từ Header) ────────────────────────────────────
interface ForgotFormProps {
  onNavigate?: (view: "login") => void;
  onClose?: () => void;
}

// ─── Form dùng được cả standalone lẫn trong modal ─────────────────────────────
export function ForgotForm({ onNavigate, onClose }: ForgotFormProps) {
  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-xl px-6 py-8 relative">
      {onClose && (
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition" aria-label="Đóng">
          <X size={20} />
        </button>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {onNavigate
            ? <button onClick={() => onNavigate("login")} className="text-gray-700 hover:text-[#C8A96A] transition"><ArrowLeft size={20} /></button>
            : <a href="/auth/login"><ArrowLeft className="cursor-pointer text-gray-700" size={20} /></a>
          }
          <span className="text-gray-800 text-base font-medium">Quên mật khẩu?</span>
        </div>
      </div>

      <p className="text-gray-700 text-xl leading-relaxed mb-10">
        Witchy Bakery sẽ gửi cho bạn mã xác minh vào email của bạn.
      </p>

      <div className="flex items-center border-b border-[#d6c2a3] pb-3 mb-10">
        <Mail size={18} className="text-[#c8a46b] mr-3" />
        <input
          type="email"
          placeholder="Nhập Email"
          className="w-full bg-transparent outline-none text-gray-800 placeholder:text-[#c8a46b]"
        />
      </div>

      <button className="w-full bg-[#1c1a17] text-white py-4 rounded-md font-semibold tracking-wide hover:opacity-90 transition">
        GỬI
      </button>
    </div>
  );
}

// ─── Page standalone — giữ nguyên như cũ ──────────────────────────────────────
export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[#f3efe9] flex items-center justify-center">
      <ForgotForm />
    </div>
  );
}