"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { productApi, type ApiProduct } from "@/app/lib/api";
import ProductCard from "@/app/components/products/ProductCard";

function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { ref, visible } = useScrollReveal();

  useEffect(() => {
    productApi.getAll({ limit: 8, page: 1 })
      .then((data) => setProducts(data.products))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <style>{`
        @keyframes featSlideUp {
          from { opacity: 0; transform: translateY(48px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes featTitleIn {
          from { opacity: 0; transform: translateX(-30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .feat-title  { animation: featTitleIn 0.65s ease both; }
        .feat-card-0 { animation: featSlideUp 0.55s 0.05s ease both; }
        .feat-card-1 { animation: featSlideUp 0.55s 0.13s ease both; }
        .feat-card-2 { animation: featSlideUp 0.55s 0.21s ease both; }
        .feat-card-3 { animation: featSlideUp 0.55s 0.29s ease both; }
        .feat-card-4 { animation: featSlideUp 0.55s 0.37s ease both; }
        .feat-card-5 { animation: featSlideUp 0.55s 0.45s ease both; }
        .feat-card-6 { animation: featSlideUp 0.55s 0.53s ease both; }
        .feat-card-7 { animation: featSlideUp 0.55s 0.61s ease both; }
        .feat-hidden { opacity: 0; }
      `}</style>

      <section className="py-16" style={{ background: "var(--background)" }} ref={ref}>
        <div className="max-w-7xl mx-auto px-6">
          <div className={`text-center mb-10 ${visible ? "feat-title" : "feat-hidden"}`}>
            <p className="text-xs tracking-[0.3em] text-[#C8A96A] uppercase mb-2 font-semibold">
              Thực đơn nổi bật
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800" style={{ fontFamily: "var(--font-heading)" }}>
              Sản phẩm bán chạy
            </h2>
            <p className="text-gray-400 text-sm mt-3 max-w-md mx-auto">
              Những chiếc bánh được yêu thích nhất, được làm từ nguyên liệu tươi ngon mỗi ngày.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-6 bg-gray-100 rounded w-1/3 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((p, i) => (
                  <div
                    key={p._id}
                    className={visible ? `feat-card-${Math.min(i, 7)}` : "feat-hidden"}
                  >
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
              <div className={`text-center mt-10 ${visible ? "feat-title" : "feat-hidden"}`}>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full border-2 border-[#C8A96A] text-[#C8A96A] font-semibold text-sm hover:bg-[#C8A96A] hover:text-white transition"
                >
                  Xem tất cả sản phẩm
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">🎂</p>
              <p>Đang cập nhật sản phẩm...</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}