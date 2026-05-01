"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, ChevronLeft, Minus, Plus, Truck, Shield, RefreshCw } from "lucide-react";
import { productApi, formatPrice, type ApiProductDetail } from "@/app/lib/api";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5001";
function resolveImgUrl(url: string): string {
  if (!url) return "/cake.jpg";
  if (url.startsWith("http")) return url;
  return `${API_BASE}${url}`;
}

/* ── Ảnh fallback theo danh mục ──────────────────────────────── */
const CATEGORY_IMGS: Record<string, string[]> = {
  "banh-kem":      ["/cake1.jpg",  "/cake.jpg",   "/cake2.jpg"],
  "banh-kem-mini": ["/cake2.jpg",  "/cake3.jpg",  "/cake1.jpg"],
  "topping":       ["/brand.jpg",  "/cakebg.png", "/cake.jpg"],
  "do-uong":       ["/cakebg.png", "/brand.jpg",  "/cake.jpg"],
};
const FALLBACK = ["/cake.jpg", "/cake1.jpg", "/cake2.jpg"];

export default function ProductDetailPage() {
  const { id }        = useParams<{ id: string }>();
  const router        = useRouter();
  const { addToCart } = useCart();
  const { user, openLoginModal } = useAuth();

  const [data,            setData]            = useState<ApiProductDetail | null>(null);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState("");
  const [qty,             setQty]             = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>();
  const [adding,          setAdding]          = useState(false);
  const [added,           setAdded]           = useState(false);
  const [activeImg,       setActiveImg]       = useState(0);
  const [tab,             setTab]             = useState<"desc" | "info">("desc");

  useEffect(() => {
    setLoading(true);
    productApi.getById(id)
      .then(d => {
        setData(d);
        if (d.variants?.[0]) setSelectedVariant(d.variants[0]._id);
      })
      .catch(() => setError("Không tìm thấy sản phẩm"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { openLoginModal(); return; }
    setAdding(true);
    try {
      await addToCart(id, qty, selectedVariant);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) { openLoginModal(); return; }
    await addToCart(id, qty, selectedVariant);
    router.push("/cart");
  };

  /* ── Ảnh: dùng ảnh DB nếu có, nếu không thì fallback theo danh mục ── */
  const catSlug =
    data?.product?.category && typeof data.product.category === "object"
      ? data.product.category.slug : "";
  const allImages =
    data?.images?.length
      ? data.images.map(i => resolveImgUrl(i.imageUrl))
      : (CATEGORY_IMGS[catSlug] ?? FALLBACK);

  const variantObj   = data?.variants?.find(v => v._id === selectedVariant);
  const displayPrice = variantObj ? variantObj.price : (data?.product.basePrice ?? 0);

  /* ── Loading / Error states ─────────────────────────────────── */
  if (loading) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[#C8A96A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-400">Đang tải sản phẩm...</p>
      </div>
    </main>
  );

  if (error || !data) return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 page-fade">
      <p className="text-5xl">🎂</p>
      <h1 className="text-2xl font-bold text-gray-700">Không tìm thấy sản phẩm</h1>
      <Link href="/products" className="btn-gold px-6 py-2.5 rounded-full text-sm">
        Quay lại cửa hàng
      </Link>
    </main>
  );

  const { product, variants } = data;

  return (
    <main className="min-h-screen page-fade" style={{ background: "var(--background)" }}>

      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-[#C8A96A] transition">Trang chủ</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#C8A96A] transition">Sản phẩm</Link>
          <span>/</span>
          <span className="text-gray-600 font-medium truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">

          {/* ── Ảnh ── */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-amber-50 shadow-sm">
              <Image
                src={allImages[activeImg] || "/cake.jpg"}
                alt={product.name}
                fill priority
                className="object-cover"
                onError={e => { (e.target as HTMLImageElement).src = "/cake.jpg"; }}
              />
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {allImages.map((src, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                      i === activeImg ? "border-[#C8A96A]" : "border-transparent hover:border-gray-300"
                    }`}>
                    <Image src={src} alt="" fill className="object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = "/cake.jpg"; }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Thông tin ── */}
          <div className="space-y-5">
            <div>
              <p className="text-xs text-[#C8A96A] font-semibold tracking-wider uppercase mb-2">
                {typeof product.category === "object" ? product.category.name : "Sản phẩm"}
              </p>
              <h1 className="text-3xl font-bold text-gray-800 mb-4"
                  style={{ fontFamily: "var(--font-heading)" }}>
                {product.name}
              </h1>
              <div className="text-3xl font-bold text-[#C8A96A]">
                {formatPrice(displayPrice * qty)}
              </div>
            </div>

            {/* Variants – chỉ hiển thị nếu sản phẩm có kích thước */}
            {variants && variants.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Kích thước / Phục vụ:</p>
                <div className="flex flex-wrap gap-2">
                  {variants.map(v => (
                    <button key={v._id} onClick={() => setSelectedVariant(v._id)}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${
                        selectedVariant === v._id
                          ? "border-[#C8A96A] bg-[#C8A96A]/10 text-[#C8A96A]"
                          : "border-gray-200 hover:border-[#C8A96A] text-gray-600"
                      }`}>
                      {v.size} · {v.serving} · {formatPrice(v.price)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Số lượng */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Số lượng:</p>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden w-fit">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition">
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center text-sm font-semibold">{qty}</span>
                <button onClick={() => setQty(q => q + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition">
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-3 pt-2">
              <button onClick={handleAddToCart} disabled={adding}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition disabled:opacity-60 ${
                  added ? "bg-green-500 text-white" : "bg-[#C8A96A] text-white hover:bg-[#a0823e]"
                }`}>
                {adding
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <ShoppingCart size={16} />
                }
                {added ? "Đã thêm!" : "Thêm vào giỏ"}
              </button>
              <button onClick={handleBuyNow}
                className="flex-1 py-3.5 rounded-2xl border-2 border-gray-800 text-gray-800 font-semibold text-sm hover:bg-gray-800 hover:text-white transition">
                Mua ngay
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
              {[
                { icon: <Truck size={16} />,     label: "Giao hàng\nnhanh" },
                { icon: <Shield size={16} />,    label: "Đảm bảo\nchất lượng" },
                { icon: <RefreshCw size={16} />, label: "Đổi trả\ndễ dàng" },
              ].map((b, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 text-center">
                  <div className="w-8 h-8 bg-amber-50 rounded-full flex items-center justify-center text-[#C8A96A]">
                    {b.icon}
                  </div>
                  <p className="text-xs text-gray-500 whitespace-pre-line leading-tight">{b.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs: Mô tả & Thông tin (đã bỏ Review) ── */}
        <div className="mb-12">
          <div className="flex gap-8 border-b border-gray-200 mb-6">
            {(["desc", "info"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`pb-3 text-sm font-medium transition border-b-2 -mb-px ${
                  tab === t
                    ? "border-[#C8A96A] text-[#C8A96A]"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}>
                {t === "desc" ? "Mô tả sản phẩm" : "Thông tin chi tiết"}
              </button>
            ))}
          </div>

          {tab === "desc" && (
            <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
              <p>{product.description || "Chưa có mô tả chi tiết."}</p>
            </div>
          )}

          {tab === "info" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {[
                { label: "Tên sản phẩm", value: product.name },
                { label: "Danh mục",     value: typeof product.category === "object" ? product.category.name : "—" },
                { label: "Giá cơ bản",   value: formatPrice(product.basePrice) },
                { label: "Trạng thái",   value: product.status === "active" ? "Còn hàng" : "Hết hàng" },
              ].map(row => (
                <div key={row.label} className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-400">{row.label}</span>
                  <span className="font-medium text-gray-700">{row.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}