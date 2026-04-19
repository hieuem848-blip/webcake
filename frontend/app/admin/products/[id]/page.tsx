"use client";
import { useEffect, useState, useRef } from "react";
import AdminShell from "../../components/AdminShell";
import { adminProductApi, adminCategoryApi, AdminProductDetail, AdminCategory, formatPrice } from "../../../lib/adminApi";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5001";
function resolveImgUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_BASE}${url}`;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string>("");
  const [detail, setDetail] = useState<AdminProductDetail | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [variantForm, setVariantForm] = useState({ size: "", serving: "", price: "" });
  const [addingVariant, setAddingVariant] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageMode, setImageMode] = useState<"file" | "url">("file");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [isMain, setIsMain] = useState(false);
  const [addingImage, setAddingImage] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", basePrice: "", category: "", isCustomizable: false, status: "active" as "active" | "inactive" });

  const reloadDetail = async (pid: string) => { const u = await adminProductApi.getById(pid); setDetail(u); };

  useEffect(() => {
    params.then(p => {
      setId(p.id);
      Promise.all([adminProductApi.getById(p.id), adminCategoryApi.getAll({ limit: 100 })])
        .then(([prod, cats]) => {
          setDetail(prod); setCategories(cats.categories);
          const cat = typeof prod.product.category === "string" ? prod.product.category : prod.product.category._id;
          setForm({ name: prod.product.name, description: prod.product.description || "", basePrice: String(prod.product.basePrice), category: cat, isCustomizable: prod.product.isCustomizable, status: prod.product.status });
        }).catch(console.error).finally(() => setLoading(false));
    });
  }, [params]);

  const handleSave = async () => {
    setSaving(true); setError(""); setSuccess("");
    try { await adminProductApi.update(id, { ...form, basePrice: Number(form.basePrice) } as Parameters<typeof adminProductApi.update>[1]); setSuccess("Đã lưu thay đổi!"); setTimeout(() => setSuccess(""), 3000); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Lỗi"); } finally { setSaving(false); }
  };

  const handleAddVariant = async () => {
    if (!variantForm.size || !variantForm.price) return;
    setAddingVariant(true);
    try { await adminProductApi.addVariant({ productId: id, ...variantForm, price: Number(variantForm.price) }); await reloadDetail(id); setVariantForm({ size: "", serving: "", price: "" }); }
    catch (e: unknown) { alert(e instanceof Error ? e.message : "Lỗi"); } finally { setAddingVariant(false); }
  };

  const handleDeleteVariant = async (vid: string) => {
    if (!confirm("Xóa kích cỡ này?")) return;
    try { await adminProductApi.deleteVariant(vid); setDetail(d => d ? { ...d, variants: d.variants.filter(v => v._id !== vid) } : d); }
    catch (e: unknown) { alert(e instanceof Error ? e.message : "Lỗi"); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { const r = ev.target?.result as string; setImagePreview(r); setImageBase64(r); };
    reader.readAsDataURL(file);
  };

  const clearImageInput = () => { setImagePreview(""); setImageBase64(""); setImageUrl(""); if (fileInputRef.current) fileInputRef.current.value = ""; };

  const handleAddImage = async () => {
    if (imageMode === "file" && !imageBase64) { alert("Vui lòng chọn ảnh"); return; }
    if (imageMode === "url" && !imageUrl) { alert("Vui lòng nhập URL"); return; }
    setAddingImage(true);
    try {
      if (imageMode === "file") await adminProductApi.addImage({ productId: id, imageBase64, isMain });
      else await adminProductApi.addImage({ productId: id, imageUrl, isMain });
      await reloadDetail(id); clearImageInput(); setIsMain(false);
    } catch (e: unknown) { alert(e instanceof Error ? e.message : "Lỗi"); } finally { setAddingImage(false); }
  };

  const handleDeleteImage = async (imgId: string) => {
    if (!confirm("Xóa ảnh này?")) return; setDeletingImageId(imgId);
    try { await adminProductApi.deleteImage(imgId); setDetail(d => d ? { ...d, images: d.images.filter(i => i._id !== imgId) } : d); }
    catch (e: unknown) { alert(e instanceof Error ? e.message : "Lỗi"); } finally { setDeletingImageId(null); }
  };

  const handleSetMain = async (imgId: string) => {
    try { await adminProductApi.setMainImage(imgId); await reloadDetail(id); }
    catch (e: unknown) { alert(e instanceof Error ? e.message : "Lỗi"); }
  };

  if (loading) return <AdminShell><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div></AdminShell>;

  return (
    <AdminShell>
      <div className="w-full space-y-5">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/admin/products" className="text-gray-500 hover:text-gray-600 transition-colors">← Sản phẩm</Link>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-gray-700">Chỉnh sửa sản phẩm</span>
        </div>

        {/* Thông tin */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Thông tin sản phẩm</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Tên sản phẩm *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-amber-400 bg-gray-50" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Mô tả</label>
              <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm resize-none focus:border-amber-400 bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Giá gốc (VND) *</label>
              <input type="number" value={form.basePrice} onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-amber-400 bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Danh mục *</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-amber-400 bg-gray-50 text-gray-700">
                <option value="">-- Chọn danh mục --</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Trạng thái</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as "active" | "inactive" }))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-amber-400 bg-gray-50 text-gray-700">
                <option value="active">Đang bán</option>
                <option value="inactive">Đã ẩn</option>
              </select>
            </div>
            <div className="flex items-center gap-2.5 pt-5">
              <input type="checkbox" id="custom" checked={form.isCustomizable} onChange={e => setForm(f => ({ ...f, isCustomizable: e.target.checked }))} className="w-4 h-4 rounded accent-amber-500" />
              <label htmlFor="custom" className="text-sm text-gray-600">Cho phép custom bánh</label>
            </div>
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</div>}
          {success && <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">{success}</div>}
        </div>

        {/* Hình ảnh */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Hình ảnh sản phẩm</h2>
          {detail?.images && detail.images.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {detail.images.map(img => (
                <div key={img._id} className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={resolveImgUrl(img.imageUrl)} alt="" className={`w-full aspect-square object-cover rounded-xl border-2 transition-all ${img.isMain ? "border-amber-400 shadow-md shadow-amber-100" : "border-gray-100"}`} />
                  {img.isMain && <span className="absolute top-1.5 left-1.5 text-xs bg-amber-500 text-white rounded-md px-1.5 py-0.5 font-medium">Chính</span>}
                  <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                    {!img.isMain && (
                      <button onClick={() => handleSetMain(img._id)} className="p-1.5 bg-white rounded-lg shadow text-amber-500 hover:bg-amber-50 transition-colors">
                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      </button>
                    )}
                    <button onClick={() => handleDeleteImage(img._id)} disabled={deletingImageId === img._id} className="p-1.5 bg-white rounded-lg shadow text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed border-gray-200 text-gray-300">
              <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <p className="mt-2 text-sm">Chưa có hình ảnh nào</p>
            </div>
          )}
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Thêm ảnh mới</p>
            <div className="flex gap-2">
              {(["file", "url"] as const).map(mode => (
                <button key={mode} onClick={() => { setImageMode(mode); clearImageInput(); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${imageMode === mode ? "bg-amber-500 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-100"}`}>
                  {mode === "file" ? "📁 Từ máy tính" : "🔗 Từ URL"}
                </button>
              ))}
            </div>
            {imageMode === "file" ? (
              <>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="img-file-input" />
                {!imagePreview ? (
                  <label htmlFor="img-file-input" className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-amber-300 hover:bg-amber-50/50 transition-all">
                    <svg width="28" height="28" fill="none" stroke="#f59e0b" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <span className="text-sm font-medium text-amber-500">Click để chọn ảnh</span>
                    <span className="text-xs text-gray-400">JPG, PNG, WEBP — tối đa 10MB</span>
                  </label>
                ) : (
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="preview" className="w-20 h-20 object-cover rounded-xl border-2 border-amber-200" />
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm text-gray-600">Ảnh đã chọn</span>
                      <button onClick={() => fileInputRef.current?.click()} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 w-fit">Đổi ảnh</button>
                      <button onClick={clearImageInput} className="text-xs text-red-400 hover:text-red-600 w-fit">Bỏ chọn</button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <input type="text" placeholder="https://example.com/image.jpg" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-amber-400 bg-white" />
            )}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                <input type="checkbox" checked={isMain} onChange={e => setIsMain(e.target.checked)} className="accent-amber-500" />
                Đặt làm ảnh chính
              </label>
              <button onClick={handleAddImage} disabled={addingImage || (imageMode === "file" ? !imageBase64 : !imageUrl)} className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 transition-colors">
                {addingImage ? "Đang tải..." : "+ Thêm ảnh"}
              </button>
            </div>
          </div>
        </div>

        {/* Biến thể */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Kích cỡ & Giá biến thể</h2>
          {detail?.variants && detail.variants.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Size</th>
                    <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Phục vụ</th>
                    <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Giá</th>
                    <th className="py-2.5 px-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {detail.variants.map(v => (
                    <tr key={v._id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="py-2.5 px-4 font-medium text-gray-700">{v.size}</td>
                      <td className="py-2.5 px-4 text-gray-500">{v.serving}</td>
                      <td className="py-2.5 px-4 font-semibold text-amber-600">{formatPrice(v.price)}</td>
                      <td className="py-2.5 px-4 text-right"><button onClick={() => handleDeleteVariant(v._id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">Xóa</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-sm text-gray-400">Chưa có kích cỡ nào</p>}
          <div className="flex gap-2 flex-wrap">
            <input placeholder="Size (vd: 20cm)" value={variantForm.size} onChange={e => setVariantForm(f => ({ ...f, size: e.target.value }))} className="px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none flex-1 min-w-24 focus:border-amber-400 bg-gray-50" />
            <input placeholder="Phục vụ (vd: 8-10 người)" value={variantForm.serving} onChange={e => setVariantForm(f => ({ ...f, serving: e.target.value }))} className="px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none flex-1 min-w-32 focus:border-amber-400 bg-gray-50" />
            <input type="number" placeholder="Giá (VND)" value={variantForm.price} onChange={e => setVariantForm(f => ({ ...f, price: e.target.value }))} className="px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none w-36 focus:border-amber-400 bg-gray-50" />
            <button onClick={handleAddVariant} disabled={addingVariant} className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-60 transition-colors">{addingVariant ? "..." : "+ Thêm"}</button>
          </div>
        </div>

        {/* Action cuối */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Kiểm tra lại thông tin trước khi lưu
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/products"
              className="px-5 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </Link>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-60 transition-colors"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>

        {/* Vùng nguy hiểm */}
        <div className="bg-white rounded-2xl border border-red-100 p-6 space-y-3">
          <h2 className="font-semibold text-red-600">Vùng nguy hiểm</h2>
          <p className="text-sm text-gray-500">Xóa sản phẩm sẽ xóa hẳn toàn bộ ảnh và biến thể, không thể hoàn tác.</p>
          <button onClick={async () => {
            if (!confirm(`Xóa hẳn sản phẩm "${form.name}"? Hành động này không thể hoàn tác.`)) return;
            try { await adminProductApi.delete(id); router.push("/admin/products"); }
            catch (e: unknown) { alert(e instanceof Error ? e.message : "Lỗi"); }
          }} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors">
            Xóa sản phẩm vĩnh viễn
          </button>
        </div>
      </div>
    </AdminShell>
  );
}