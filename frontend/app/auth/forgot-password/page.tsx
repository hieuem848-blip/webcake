"use client";

import { ArrowLeft, X, Phone, Mail } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[#f3efe9] flex items-center justify-center">

      {/* KHUNG (CARD) */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl px-6 py-8 relative">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <ArrowLeft className="cursor-pointer text-gray-700" size={20} />
            </Link>
            <span className="text-gray-800 text-base font-medium">
              Quên mật khẩu?
            </span>
          </div>
          
        </div>

        {/* TEXT */}
        <p className="text-gray-700 text-xl leading-relaxed mb-10">
          Witchy Barkery sẽ gửi cho bạn mã xác minh vào điện thoại của bạn.
        </p>

        {/* INPUT */}
        <div className="flex items-center border-b border-[#d6c2a3] pb-3 mb-10">
          <Mail size={18} className="text-[#c8a46b] mr-3" />
          <input
            type="Email"
            placeholder="Nhập Emai"
            className="w-full bg-transparent outline-none text-gray-800 placeholder:text-[#c8a46b]"
          />
        </div>

        {/* BUTTON */}
        <button className="w-full bg-[#1c1a17] text-white py-4 rounded-md font-semibold tracking-wide hover:opacity-90 transition">
          GỬI
        </button>

      </div>
    </div>
  );
}