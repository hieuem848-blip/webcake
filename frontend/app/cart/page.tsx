"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ChevronLeft,
  AlertCircle,
} from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";
import { formatPrice } from "@/app/lib/api";
import { useRouter } from "next/navigation";

const SHIPPING_THRESHOLD = 500000;
const SHIPPING_FEE = 30000;

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, loading } =
    useCart();
  const { user, openLoginModal } = useAuth();
  const router = useRouter();

  const shippingFee =
    totalPrice >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const finalTotal = totalPrice + shippingFee;

  const placeholders = [
    "/cake.jpg",
    "/cake1.jpg",
    "/cake2.jpg",
    "/cake3.jpg",
  ];

  // 🔒 Chưa login
  if (!user)
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-5 page-fade">
        <div className="text-center">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-[#C8A96A]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Vui lòng đăng nhập
          </h1>
          <p className="text-gray-400 text-sm mb-6">
            Đăng nhập để xem giỏ hàng của bạn
          </p>
          <button
            onClick={openLoginModal}
            className="btn-gold inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm"
          >
            Đăng nhập
          </button>
        </div>
      </main>
    );

  // 🛒 Giỏ trống
  if (items.length === 0)
    return (
      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 bg-gray-100">
        <div className="text-center max-w-sm w-full">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={32} className="text-[#C8A96A]" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            Giỏ hàng trống
          </h1>
          <p className="text-gray-400 text-sm mb-6">
            Hãy khám phá những chiếc bánh ngon của chúng tôi!
          </p>
          <Link
            href="/products"
            className="btn-gold inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm w-full"
          >
            <ShoppingBag size={16} />
            Khám phá sản phẩm
          </Link>
        </div>
      </main>
    );

  return (
    <main className="w-full bg-gray-100">
      {/* HEADER */}
      <div className="bg-[#1c1d21]">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#A79F91]">
              Giỏ hàng
            </h1>
            <p className="text-sm text-[#A79F91] mt-0.5">
              {items.length} sản phẩm
            </p>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1.5 text-sm text-[#C8A96A] hover:underline font-medium"
          >
            <ChevronLeft size={13} /> Tiếp tục mua sắm
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-4">

            {/* SHIPPING */}
            {totalPrice < SHIPPING_THRESHOLD && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-sm text-amber-700 font-medium">
                  Thêm{" "}
                  <span className="font-bold">
                    {formatPrice(SHIPPING_THRESHOLD - totalPrice)}
                  </span>{" "}
                  để được miễn phí giao hàng
                </p>
                <div className="mt-2 h-2 bg-amber-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (totalPrice / SHIPPING_THRESHOLD) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* ITEMS */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

              {/* HEADER TABLE */}
              <div className="grid grid-cols-12 px-6 py-4 text-sm font-semibold text-gray-500 border-b border-gray-200">
                <div className="col-span-4 ">Sản phẩm</div>
                <div className="col-span-2 text-center">Đơn giá</div>
                <div className="col-span-3 text-center">Số lượng</div>
                <div className="col-span-2 text-center">Thành tiền</div>
                <div className="col-span-1 text-center"></div>
              </div>

              {/* ROWS */}
              {items.map((item) => {
                const productName =
                  item.product?.name || "Sản phẩm";
                const imgIndex =
                  productName.charCodeAt(0) %
                  placeholders.length;

                return (
                  <div
                    key={item._id}
                    className={`grid grid-cols-12 gap-4 items-center px-6 py-5 ${
                      loading ? "opacity-60" : ""
                    }`}
                  >
                    {/* PRODUCT */}
                    <div className="col-span-4 flex items-center gap-4">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-amber-50">
                        <Image
                          src={placeholders[imgIndex]}
                          alt={productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-800">
                          {productName}
                        </h3>
                        {item.variant && (
                          <p className="text-sm text-gray-400">
                            {item.variant.size} ·{" "}
                            {item.variant.serving} người
                          </p>
                        )}
                      </div>
                    </div>

                    {/* PRICE */}
                    <div className="col-span-2 text-center text-base font-bold text-[#C8A96A]">
                      {formatPrice(item.price)}
                    </div>

                    {/* QUANTITY */}
                    <div className="col-span-3 flex justify-center">
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item._id,
                              item.quantity - 1
                            )
                          }
                          disabled={loading}
                          className="w-9 h-9 flex items-center justify-center hover:bg-gray-50"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-12 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item._id,
                              item.quantity + 1
                            )
                          }
                          disabled={loading}
                          className="w-9 h-9 flex items-center justify-center hover:bg-gray-50"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* TOTAL */}
                    <div className="col-span-2 text-center text-lg font-bold text-gray-800">
                      {formatPrice(
                        item.price * item.quantity
                      )}
                    </div>

                    {/* DELETE */}
                    <div className="col-span-1 flex justify-center">
                      <button
                        onClick={() =>
                          removeFromCart(item._id)
                        }
                        disabled={loading}
                        className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-xl"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT */}
          <div className="h-full">
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-gray-800">
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-medium">
                    {formatPrice(totalPrice)}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Phí giao hàng</span>
                  <span
                    className={
                      shippingFee === 0
                        ? "text-green-500 font-medium"
                        : "font-medium"
                    }
                  >
                    {shippingFee === 0
                      ? "Miễn phí"
                      : formatPrice(shippingFee)}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-800">
                  <span>Tổng cộng</span>
                  <span className="text-[#C8A96A] text-lg">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                className="w-full btn-gold py-3.5 rounded-xl text-sm font-semibold"
              >
                Tiến hành thanh toán
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}