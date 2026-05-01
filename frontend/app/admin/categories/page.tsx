"use client";
import { useEffect, useState, useCallback } from "react";
import AdminShell from "../components/AdminShell";
import { adminCategoryApi, AdminCategory } from "../../lib/adminApi";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<AdminCategory | null>(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminCategoryApi.getAll({ keyword, limit: 50 });
      setCategories(res.categories);
      setTotal(res.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [keyword]);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const openCreate = () => {
    setEditItem(null); setFormName(""); setFormDesc(""); setError(""); setShowForm(true);
  };
  const openEdit = (cat: AdminCategory) => {
    setEditItem(cat); setFormName(cat.name); setFormDesc(cat.description || ""); setError(""); setShowForm(true);
  };
  const handleSave = async () => {
    if (!formName.trim()) { setError("Tên danh mục không được để trống"); return; }
    setSaving(true); setError("");
    try {
      if (editItem) await adminCategoryApi.update(editItem._id, { name: formName, description: formDesc });
      else await adminCategoryApi.create({ name: formName, description: formDesc });
      setShowForm(false);
      loadCategories();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Lỗi"); }
    finally { setSaving(false); }
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Xóa danh mục này? Chỉ có thể xóa nếu không có sản phẩm đang dùng.")) return;
    try { await adminCategoryApi.delete(id); loadCategories(); }
    catch (e: unknown) { alert(e instanceof Error ? e.message : "Lỗi"); }
  };
  const handleToggle = async (id: string) => {
    if (togglingId) return;

    const cat = categories.find(c => c._id === id);
    if (!cat) return;
    const message = cat.isActive
      ? "Ẩn danh mục này?\nCác sản phẩm trong danh mục có thể không hiển thị!"
      : "Hiện lại danh mục này?";

    if (!confirm(message)) return;

    setTogglingId(id);
    setCategories(prev =>
      prev.map(c => c._id === id ? { ...c, isActive: !c.isActive } : c)
    );

    try {
      await adminCategoryApi.toggle(id);
    } catch (e: unknown) {
      setCategories(prev =>
        prev.map(c => c._id === id ? { ...c, isActive: !c.isActive } : c)
      );
      alert(e instanceof Error ? e.message : "Lỗi khi thay đổi trạng thái");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <AdminShell>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Danh mục</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Tổng cộng <span className="font-semibold text-gray-600">{total}</span> danh mục
            </p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm shadow-amber-200 hover:shadow-amber-300 hover:-translate-y-0.5 transition-all"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Thêm danh mục
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="relative max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-300">
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              <p className="mt-3 text-sm">Chưa có danh mục nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tên danh mục</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Slug</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Mô tả</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</th>
                    <th className="text-center px-10 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {categories.map(cat => (
                    <tr key={cat._id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                            <svg width="14" height="14" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                            </svg>
                          </div>
                          <span className="font-semibold text-gray-800">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <code className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 font-medium">
                          {cat.slug}
                        </code>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500 max-w-xs">
                        <span className="truncate block">{cat.description || "—"}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          cat.isActive
                            ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                            : "text-gray-500 bg-gray-50 border-gray-200"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cat.isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                          {cat.isActive ? "Hoạt động" : "Đã ẩn"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(cat)}
                            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-100 text-gray-600 hover:bg-amber-100 hover:text-amber-700 transition-colors"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleToggle(cat._id)}
                            disabled={togglingId === cat._id}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors disabled:opacity-40 ${
                              togglingId === cat._id
                                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                : cat.isActive
                                  ? "border-orange-200 text-orange-500 hover:bg-orange-50"
                                  : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                            }`}
                          >
                            {togglingId === cat._id
                              ? <span className="flex items-center gap-1"><span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" /></span>
                              : cat.isActive ? "Ẩn" : "Hiện"
                            }
                          </button>
                          <button
                            onClick={() => handleDelete(cat._id)}
                            className="px-3 py-1.5 rounded-xl text-xs font-medium border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ───────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-lg text-gray-800">
                {editItem ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Bánh sinh nhật, Bánh kem, ..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="Mô tả ngắn về danh mục..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all resize-none"
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  {error}
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition-all shadow-sm"
                style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang lưu...
                  </span>
                ) : editItem ? "Lưu thay đổi" : "Tạo danh mục"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}