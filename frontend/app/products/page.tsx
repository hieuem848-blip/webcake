"use client";

import { useState, useEffect, useCallback } from "react";
import { SlidersHorizontal, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { productApi, categoryApi, type ApiProduct, type ApiCategory } from "@/app/lib/api";
import ProductCard from "@/app/components/products/ProductCard";
import Image from "next/image";

export default function ProductsPage() {
  const [products,    setProducts]    = useState<ApiProduct[]>([]);
  const [categories,  setCategories]  = useState<ApiCategory[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const LIMIT = 12;

  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy,         setSortBy]         = useState("default");
  const [searchQuery,    setSearchQuery]    = useState("");
  const [minPrice,       setMinPrice]       = useState("");
  const [maxPrice,       setMaxPrice]       = useState("");

  // load categories once
  useEffect(() => {
    categoryApi.getAll()
      .then(cats => setCategories([{ _id: "all", name: "Tất cả", slug: "all" }, ...cats]))
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: LIMIT };
      if (activeCategory !== "all") params.category = activeCategory;
      if (searchQuery.trim())       params.search   = searchQuery.trim();
      if (minPrice)                 params.minPrice = Number(minPrice);
      if (maxPrice)                 params.maxPrice = Number(maxPrice);
      if (sortBy !== "default")     params.sort     = sortBy;

      const data = await productApi.getAll(
        params as Parameters<typeof productApi.getAll>[0]
      );
      const items = data.products;

      setProducts(items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, activeCategory, searchQuery, minPrice, maxPrice, sortBy]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleCategory = (slug: string) => { setActiveCategory(slug); setPage(1); };

  return (
    <main className=" bg-[#F7F6F3]">

      {/* Hero */}
      <section className="relative w-full h-[300px] md:h-[340px] border-b border-amber-100 overflow-hidden">
        {/* background image */}
        <Image
          src="/cakebg.png"
          alt="Hero background"
          fill
          className="object-cover"
          priority
        />

        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-center items-center text-center text-white">
          <p className="text-xs tracking-[0.3em] uppercase mb-3 font-semibold text-amber-200">
            Witchy Bakery
          </p>

          <h1
            className="text-4xl md:text-5xl font-bold mb-3"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Cửa hàng bánh kem
          </h1>
          <p className="max-w-md mx-auto text-sm leading-relaxed text-gray-200">
            Tất cả sản phẩm được làm thủ công mỗi ngày — từ bánh kem đến topping trái cây tươi.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Search */}
        <div className="relative max-w-lg mx-auto mb-8">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-10 py-3 rounded-full border border-gray-200 bg-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-[#C8A96A]/40 focus:border-[#C8A96A]"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(""); setPage(1); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          {categories.map(cat => (
            <button key={cat._id} onClick={() => handleCategory(cat.slug)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition border ${
                activeCategory === cat.slug
                  ? "bg-[#C8A96A] text-white border-[#C8A96A]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#C8A96A] hover:text-[#C8A96A]"
              }`}>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort bar */}
        <div className="flex items-center gap-3 mb-6">
          <p className="text-sm text-gray-400">
            <span className="font-semibold text-gray-700">{total}</span> sản phẩm
          </p>
          <SlidersHorizontal size={14} className="text-gray-400" />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white
                       focus:outline-none focus:ring-2 focus:ring-[#C8A96A]/30">
            <option value="default">Mặc định</option>
            <option value="price-asc">Giá: Thấp → Cao</option>
            <option value="price-desc">Giá: Cao → Thấp</option>
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="font-medium">Không tìm thấy sản phẩm phù hợp</p>
            <p className="text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200
                         hover:border-[#C8A96A] disabled:opacity-40 transition">
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-full text-sm font-medium transition ${
                  p === page
                    ? "bg-[#C8A96A] text-white"
                    : "border border-gray-200 hover:border-[#C8A96A] text-gray-600"
                }`}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200
                         hover:border-[#C8A96A] disabled:opacity-40 transition">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}