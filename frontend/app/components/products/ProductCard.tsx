"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";
import { formatPrice, type ApiProduct } from "@/app/lib/api";

interface Props { product: ApiProduct; }

/**
 * Ảnh fallback theo slug danh mục.
 * Khi backend trả về ảnh thật (productImages) thì trang chi tiết
 * sẽ dùng ảnh thật; ProductCard chỉ cần ảnh đại diện nhanh.
 */
const CATEGORY_IMG: Record<string, string> = {
  "banh-kem":      "/cake1.jpg",
  "banh-kem-mini": "/cake2.jpg",
  "topping":       "/brand.jpg",
  "do-uong":       "/cakebg.png",
};

function thumb(product: ApiProduct): string {
  if (product.mainImageUrl) return product.mainImageUrl; // ✅ ưu tiên ảnh chính nếu có
  const slug = typeof product.category === "object" ? product.category.slug : "";
  return CATEGORY_IMG[slug] ?? "/cake.jpg";
}

export default function ProductCard({ product }: Props) {
  const { addToCart } = useCart();
  const { user, openLoginModal } = useAuth();
  const [adding, setAdding] = useState(false);
  const [added,  setAdded]  = useState(false);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { openLoginModal(); return; }
    setAdding(true);
    try {
      await addToCart(product._id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } finally {
      setAdding(false);
    }
  };

  const categoryName =
    typeof product.category === "object" ? product.category.name : "Sản phẩm";

  return (
    <Link
      href={`/products/${product._id}`}
      className="group product-card bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition block"
    >
      {/* ── Ảnh ── */}
      <div className="relative aspect-square bg-amber-50 overflow-hidden">
        <Image
          src={thumb(product)}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition duration-500"
        />
      </div>

      {/* ── Thông tin ── */}
      <div className="p-4">
        <p className="text-xs text-[#C8A96A] mb-1 font-medium">{categoryName}</p>
        <h3 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-2 leading-snug group-hover:text-[#C8A96A] transition">
          {product.name}
        </h3>
        <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-gray-800">
            {formatPrice(product.basePrice)}
          </span>
          <button
            onClick={handleAdd}
            disabled={adding}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition disabled:opacity-60 ${
              added
                ? "bg-green-500 text-white"
                : "bg-[#C8A96A] text-white hover:bg-[#a0823e]"
            }`}
          >
            {adding
              ? <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
              : <ShoppingCart size={12} />
            }
            {added ? "Đã thêm!" : "Thêm vào giỏ"}
          </button>
        </div>
      </div>
    </Link>
  );
}