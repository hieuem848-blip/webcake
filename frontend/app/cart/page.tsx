"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ChevronLeft, AlertCircle } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";
import { formatPrice } from "@/app/lib/api";
import { useRouter } from "next/navigation";

const SHIPPING_THRESHOLD = 500000;
const SHIPPING_FEE = 30000;

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, loading } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const shippingFee = totalPrice >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const finalTotal = totalPrice + shippingFee;

  const placeholders = ["/cake.jpg", "/cake1.jpg", "/cake2.jpg", "/cake3.jpg"];

  if (!user) return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-5 page-fade" style={{ background: "var(--background)" }}>
      <div className="text-center">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} className="text-[#C8A96A]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          Vui lòng đăng nhập
        </h1>
        <p className="text-gray-400 text-sm mb-6">Đăng nhập để xem giỏ hàng của bạn</p>
        <Link href="/auth/login?redirect=/cart" className="btn-gold inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm">
          Đăng nhập
        </Link>
      </div>
    </main>
  );

  if (items.length === 0) return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-5 page-fade" style={{ background: "var(--background)" }}>
      <div className="text-center">
        <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <ShoppingBag size={36} className="text-[#C8A96A]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          Giỏ hàng trống
        </h1>
        <p className="text-gray-400 text-sm mb-6">Hãy khám phá những chiếc bánh ngon của chúng tôi!</p>
        <Link href="/products" className="btn-gold inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm">
          <ShoppingBag size={15} /> Khám phá sản phẩm
        </Link>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen page-fade" style={{ background: "var(--background)" }}>
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "var(--font-heading)" }}>Giỏ hàng</h1>
            <p className="text-sm text-gray-400 mt-0.5">{items.length} sản phẩm</p>
          </div>
          <Link href="/products" className="flex items-center gap-1.5 text-sm text-[#C8A96A] hover:underline font-medium">
            <ChevronLeft size={15} /> Tiếp tục mua sắm
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {totalPrice < SHIPPING_THRESHOLD && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-sm text-amber-700 font-medium">
                  Thêm <span className="font-bold">{formatPrice(SHIPPING_THRESHOLD - totalPrice)}</span> để được miễn phí giao hàng 🎉
                </p>
                <div className="mt-2 h-2 bg-amber-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${Math.min(100, (totalPrice / SHIPPING_THRESHOLD) * 100)}%` }} />
                </div>
              </div>
            )}

            {items.map((item) => {
              const productName = item.product?.name || "Sản phẩm";
              const imgIndex = productName.charCodeAt(0) % placeholders.length;
              return (
                <div key={item._id} className={`bg-white rounded-2xl p-5 flex gap-4 shadow-sm transition ${loading ? "opacity-60" : ""}`}>
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-amber-50 shrink-0">
                    <Image src={placeholders[imgIndex]} alt={productName} fill className="object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/cake.jpg"; }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-800 mb-0.5 truncate">{productName}</h3>
                    {item.variant && (
                      <p className="text-xs text-gray-400 mb-1">{item.variant.size} · {item.variant.serving} người</p>
                    )}
                    <p className="text-sm font-bold text-[#C8A96A]">{formatPrice(item.price)}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                        <button onClick={() => updateQuantity(item._id, item.quantity - 1)} disabled={loading}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50">
                          <Minus size={12} />
                        </button>
                        <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, item.quantity + 1)} disabled={loading}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50">
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-800">{formatPrice(item.price * item.quantity)}</span>
                        <button onClick={() => removeFromCart(item._id)} disabled={loading}
                          className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition disabled:opacity-50">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-28 h-fit">
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-gray-800" style={{ fontFamily: "var(--font-heading)" }}>Tóm tắt đơn hàng</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí giao hàng</span>
                  <span className={shippingFee === 0 ? "text-green-500 font-medium" : "font-medium"}>
                    {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
                  </span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-800">
                  <span>Tổng cộng</span>
                  <span className="text-[#C8A96A] text-lg">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <button onClick={() => router.push("/checkout")}
                className="w-full btn-gold py-3.5 rounded-xl text-sm font-semibold mt-2">
                Tiến hành thanh toán →
              </button>
              <Link href="/products" className="block text-center text-sm text-gray-400 hover:text-[#C8A96A] transition mt-2">
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
