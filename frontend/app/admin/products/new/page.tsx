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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageMode, setImageMode] = useState<"file" | "url">("file");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageBase64, setImageBase64] = useState("");

  useEffect(() => {
    adminCategoryApi.getAll({ limit: 100 }).then(r => setCategories(r.categories)).catch(() => {});
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { const r = ev.target?.result as string; setImagePreview(r); setImageBase64(r); };
    reader.readAsDataURL(file);
  };

  const clearImageInput = () => { setImagePreview(""); setImageBase64(""); setImageUrl(""); if (fileInputRef.current) fileInputRef.current.value = ""; };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.basePrice || !form.category) { setError("Vui lòng điền đầy đủ thông tin bắt buộc"); return; }
    setSaving(true); setError("");
    try {
      const res = await adminProductApi.create({ name: form.name, description: form.description, basePrice: Number(form.basePrice), category: form.category, isCustomizable: form.isCustomizable });
      const productId = res.product._id;
      if (imageBase64 && imageMode === "file") await adminProductApi.addImage({ productId, imageBase64, isMain: true });
      else if (imageUrl && imageMode === "url") await adminProductApi.addImage({ productId, imageUrl, isMain: true });
      router.push(`/admin/products/${productId}`);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Lỗi"); setSaving(false); }
  };

  return (
    <AdminShell>
      <div className="w-full space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/admin/products" className="text-gray-500 hover:text-gray-600 transition-colors">← Sản phẩm</Link>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-gray-700">Thêm sản phẩm mới</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Thông tin */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Thông tin sản phẩm
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Tên */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  Tên sản phẩm *
                </label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Bánh sinh nhật chocolate..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-amber-400 bg-gray-50"
                />
              </div>

              {/* Giá */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  Giá gốc (VND) *
                </label>
                <input
                  type="number"
                  value={form.basePrice}
                  onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))}
                  placeholder="350000"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-amber-400 bg-gray-50"
                />
              </div>

              {/* Mô tả */}
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  Mô tả
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Mô tả chi tiết về sản phẩm..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm resize-none focus:border-amber-400 bg-gray-50"
                />
              </div>

              {/* Danh mục */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  Danh mục *
                </label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-amber-400 bg-gray-50 text-gray-700"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Checkbox */}
              <div className="flex items-center gap-2.5 pt-6">
                <input
                  type="checkbox"
                  id="custom"
                  checked={form.isCustomizable}
                  onChange={e => setForm(f => ({ ...f, isCustomizable: e.target.checked }))}
                  className="w-4 h-4 rounded accent-amber-500"
                />
                <label htmlFor="custom" className="text-sm text-gray-600">
                  Cho phép custom bánh
                </label>
              </div>

            </div>
          </div>

          {/* Ảnh */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Ảnh sản phẩm <span className="text-gray-400 normal-case font-normal">(không bắt buộc — có thể thêm sau)</span>
            </h2>
            <div className="flex gap-2">
              {(["file", "url"] as const).map(mode => (
                <button key={mode} type="button" onClick={() => { setImageMode(mode); clearImageInput(); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${imageMode === mode ? "bg-amber-500 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-100"}`}>
                  {mode === "file" ? "📁 Từ máy tính" : "🔗 Từ URL"}
                </button>
              ))}
            </div>
            {imageMode === "file" ? (
              <>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="new-img-file-input" />
                {!imagePreview ? (
                  <label htmlFor="new-img-file-input" className="flex flex-col items-center justify-center gap-2 py-10 rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-amber-300 hover:bg-amber-50/50 transition-all">
                    <svg width="32" height="32" fill="none" stroke="#f59e0b" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <span className="text-sm font-medium text-amber-500">Click để chọn ảnh</span>
                    <span className="text-xs text-gray-400">JPG, PNG, WEBP — tối đa 10MB</span>
                  </label>
                ) : (
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="preview" className="w-28 h-28 object-cover rounded-xl border-2 border-amber-200 shadow-sm" />
                    <div className="flex flex-col gap-2">
                      <span className="text-sm text-green-600 font-medium">✓ Ảnh đã chọn — sẽ là ảnh chính</span>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 w-fit">Đổi ảnh</button>
                      <button type="button" onClick={clearImageInput} className="text-xs text-red-400 hover:text-red-600 w-fit">Bỏ chọn</button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <input type="text" placeholder="https://example.com/image.jpg" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-amber-400 bg-gray-50" />
            )}
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</div>}
          
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-60 transition-colors">
                {saving ? "Đang tạo..." : "Tạo sản phẩm"}
              </button>
              <Link href="/admin/products" className="px-6 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">Hủy</Link>
            </div>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}