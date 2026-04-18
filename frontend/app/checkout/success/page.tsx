"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

export default function CheckoutSuccessPage() {
  const params = useSearchParams();
  const vnpResponseCode = params.get("vnp_ResponseCode");
  const orderId = params.get("vnp_TxnRef") || params.get("orderId");
  const isSuccess = !vnpResponseCode || vnpResponseCode === "00";

  return (
    <main className="min-h-screen flex items-center justify-center px-6 page-fade" style={{ background: "var(--background)" }}>
      <div className="text-center max-w-md">
        <div className={`w-20 h-20 ${isSuccess ? "bg-green-100" : "bg-red-100"} rounded-full flex items-center justify-center mx-auto mb-6`}>
          {isSuccess
            ? <CheckCircle2 size={40} className="text-green-500" />
            : <XCircle size={40} className="text-red-500" />}
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3" style={{ fontFamily: "var(--font-heading)" }}>
          {isSuccess ? "Thanh toán thành công! 🎉" : "Thanh toán thất bại"}
        </h1>
        {orderId && <p className="text-sm text-gray-500 mb-2">Mã đơn hàng: <span className="font-mono font-semibold text-gray-700">{orderId}</span></p>}
        <p className="text-gray-400 text-sm mb-8">
          {isSuccess ? "Cảm ơn bạn đã mua hàng tại Witchy Bakery!" : "Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isSuccess && <Link href="/orders" className="btn-gold px-6 py-3 rounded-xl text-sm font-semibold">Xem đơn hàng</Link>}
          <Link href="/products" className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-[#C8A96A] hover:text-[#C8A96A] transition">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </main>
  );
}
