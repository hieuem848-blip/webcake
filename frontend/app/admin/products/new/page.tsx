"use client";
import { useEffect, useState, useRef } from "react";
import AdminShell from "../../components/AdminShell";
import { adminProductApi, adminCategoryApi, AdminCategory } from "../../../lib/adminApi";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [form, setForm] = useState({ name: "", description: "", basePrice: "", category: "", isCustomizable: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Image upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageMode, setImageMode] = useState<"file" | "url">("file");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageBase64, setImageBase64] = useState("");

  useEffect(() => {
    adminCategoryApi.getAll({ limit: 100 }).then(r => setCategories(r.categories)).catch(() => {});
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImagePreview(result);
      setImageBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const clearImageInput = () => {
    setImagePreview(""); setImageBase64(""); setImageUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.basePrice || !form.category) { setError("Vui lòng điền đầy đủ thông tin bắt buộc"); return; }
    setSaving(true); setError("");
    try {
      const res = await adminProductApi.create({
        name: form.name,
        description: form.description,
        basePrice: Number(form.basePrice),
        category: form.category,
        isCustomizable: form.isCustomizable,
      });

      const productId = res.product._id;

      // Upload ảnh nếu có
      if (imageBase64 && imageMode === "file") {
        await adminProductApi.addImage({ productId, imageBase64, isMain: true });
      } else if (imageUrl && imageMode === "url") {
        await adminProductApi.addImage({ productId, imageUrl, isMain: true });
      }

      router.push(`/admin/products/${productId}`);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Lỗi"); setSaving(false); }
  };

  return (
    <AdminShell>
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="text-sm" style={{ color: "#C8A96A" }}>← Sản phẩm</Link>
          <span style={{ color: "#ccc" }}>/</span>
          <h1 className="text-xl font-bold" style={{ fontFamily: "Georgia, serif", color: "#1a1a1a" }}>Thêm sản phẩm mới</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Thông tin cơ bản */}
          <div className="bg-white rounded-2xl p-6 border space-y-4" style={{ borderColor: "#e8ddd0" }}>
            <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Thông tin sản phẩm</h2>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#444" }}>Tên sản phẩm *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Bánh sinh nhật chocolate..."
                className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm"
                style={{ borderColor: "#e0d0b8", background: "#fdf9f4" }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#444" }}>Mô tả</label>
              <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Mô tả chi tiết về sản phẩm..."
                className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm resize-none"
                style={{ borderColor: "#e0d0b8", background: "#fdf9f4" }} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#444" }}>Giá gốc (VND) *</label>
                <input type="number" value={form.basePrice} onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))}
                  placeholder="350000"
                  className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm"
                  style={{ borderColor: "#e0d0b8", background: "#fdf9f4" }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#444" }}>Danh mục *</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm"
                  style={{ borderColor: "#e0d0b8", background: "#fdf9f4", color: form.category ? "#333" : "#aaa" }}>
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="custom" checked={form.isCustomizable} onChange={e => setForm(f => ({ ...f, isCustomizable: e.target.checked }))}
                className="w-4 h-4 rounded" style={{ accentColor: "#C8A96A" }} />
              <label htmlFor="custom" className="text-sm" style={{ color: "#444" }}>Cho phép custom bánh</label>
            </div>
          </div>

          {/* Ảnh sản phẩm */}
          <div className="bg-white rounded-2xl p-6 border space-y-4" style={{ borderColor: "#e8ddd0" }}>
            <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Ảnh sản phẩm <span className="text-gray-400 normal-case font-normal">(không bắt buộc — có thể thêm sau)</span></h2>

            {/* Mode toggle */}
            <div className="flex gap-2">
              <button type="button"
                onClick={() => { setImageMode("file"); clearImageInput(); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  imageMode === "file" ? "text-white shadow-sm" : "bg-white border text-gray-500 hover:bg-gray-50"
                }`}
                style={imageMode === "file" ? { background: "#C8A96A" } : { borderColor: "#e0d0b8" }}
              >
                📁 Từ máy tính
              </button>
              <button type="button"
                onClick={() => { setImageMode("url"); clearImageInput(); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  imageMode === "url" ? "text-white shadow-sm" : "bg-white border text-gray-500 hover:bg-gray-50"
                }`}
                style={imageMode === "url" ? { background: "#C8A96A" } : { borderColor: "#e0d0b8" }}
              >
                🔗 Từ URL
              </button>
            </div>

            {imageMode === "file" ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="new-img-file-input"
                />
                {!imagePreview ? (
                  <label
                    htmlFor="new-img-file-input"
                    className="flex flex-col items-center justify-center gap-2 py-10 rounded-xl border-2 border-dashed cursor-pointer hover:border-amber-300 hover:bg-amber-50/50 transition-all"
                    style={{ borderColor: "#e0d0b8" }}
                  >
                    <svg width="32" height="32" fill="none" stroke="#C8A96A" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span className="text-sm font-medium" style={{ color: "#C8A96A" }}>Click để chọn ảnh</span>
                    <span className="text-xs text-gray-400">JPG, PNG, WEBP — tối đa 10MB</span>
                  </label>
                ) : (
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="preview" className="w-28 h-28 object-cover rounded-xl border-2 border-amber-200 shadow-sm" />
                    <div className="flex flex-col gap-2">
                      <span className="text-sm text-emerald-600 font-medium">✓ Ảnh đã chọn — sẽ là ảnh chính</span>
                      <button type="button"
                        onClick={() => { if (fileInputRef.current) fileInputRef.current.click(); }}
                        className="text-xs px-3 py-1.5 rounded-lg border text-gray-500 hover:bg-gray-100 transition-colors w-fit"
                        style={{ borderColor: "#e0d0b8" }}
                      >
                        Đổi ảnh
                      </button>
                      <button type="button" onClick={clearImageInput} className="text-xs text-red-400 hover:text-red-600 transition-colors w-fit">
                        Bỏ chọn
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                style={{ borderColor: "#e0d0b8", background: "#fdf9f4" }}
              />
            )}
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</div>}

          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "#C8A96A" }}>
              {saving ? "Đang tạo..." : "Tạo sản phẩm"}
            </button>
            <Link href="/admin/products"
              className="px-6 py-2.5 rounded-xl text-sm font-medium border"
              style={{ borderColor: "#e0d0b8", color: "#666" }}>
              Hủy
            </Link>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
