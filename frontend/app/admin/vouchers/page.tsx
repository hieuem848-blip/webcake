"use client";
import { useEffect, useState, useCallback } from "react";
import AdminShell from "../components/AdminShell";
import { adminVoucherApi, formatPrice } from "../../lib/adminApi";
import {
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  Tag, Loader2, X, Check, AlertCircle, Search, Percent, DollarSign,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface Voucher {
  _id: string;
  code: string;
  description: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usageCount: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
}

type VoucherForm = {
  code: string;
  description: string;
  discountType: "percent" | "fixed";
  discountValue: string;
  minOrderValue: string;
  maxDiscountAmount: string;
  usageLimit: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

const emptyForm: VoucherForm = {
  code: "", description: "",
  discountType: "percent", discountValue: "",
  minOrderValue: "", maxDiscountAmount: "",
  usageLimit: "", startDate: "", endDate: "",
  isActive: true,
};

function toDateInput(iso?: string | null) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

// ── Modal ──────────────────────────────────────────────────────────────────
function VoucherModal({
  voucher, onClose, onSave,
}: {
  voucher: Voucher | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const isEdit = !!voucher;
  const [form, setForm] = useState<VoucherForm>(
    voucher
      ? {
          code: voucher.code,
          description: voucher.description || "",
          discountType: voucher.discountType,
          discountValue: String(voucher.discountValue),
          minOrderValue: String(voucher.minOrderValue || ""),
          maxDiscountAmount: voucher.maxDiscountAmount ? String(voucher.maxDiscountAmount) : "",
          usageLimit: voucher.usageLimit ? String(voucher.usageLimit) : "",
          startDate: toDateInput(voucher.startDate),
          endDate: toDateInput(voucher.endDate),
          isActive: voucher.isActive,
        }
      : { ...emptyForm }
  );
  const [errors, setErrors] = useState<Partial<VoucherForm>>({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const set = (k: keyof VoucherForm, v: string | boolean) =>
    setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e: Partial<VoucherForm> = {};
    if (!form.code.trim()) e.code = "Nhập mã voucher";
    if (!form.discountValue || isNaN(Number(form.discountValue)) || Number(form.discountValue) <= 0)
      e.discountValue = "Giá trị giảm phải lớn hơn 0";
    if (form.discountType === "percent" && Number(form.discountValue) > 100)
      e.discountValue = "Phần trăm tối đa là 100";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    setServerError("");
    try {
      const body = {
        code: form.code.trim().toUpperCase(),
        description: form.description,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderValue: Number(form.minOrderValue) || 0,
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        isActive: form.isActive,
      };

      if (isEdit) {
        await adminVoucherApi.update(voucher!._id, body);
      } else {
        await adminVoucherApi.create(body);
      }
      onSave();
      onClose();
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Lỗi khi lưu voucher");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Tag size={18} className="text-amber-500" />
            {isEdit ? "Chỉnh sửa voucher" : "Thêm voucher mới"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {serverError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              <AlertCircle size={14} /> {serverError}
            </div>
          )}

          {/* Code */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Mã voucher *</label>
            <input
              type="text"
              placeholder="VD: SUMMER20"
              value={form.code}
              disabled={isEdit}
              onChange={(e) => { set("code", e.target.value.toUpperCase()); setErrors(p => ({ ...p, code: "" })); }}
              className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none uppercase font-mono font-bold tracking-widest transition
                ${errors.code ? "border-red-300" : "border-gray-200 focus:border-amber-400"}
                ${isEdit ? "bg-gray-50 text-gray-400 cursor-not-allowed" : ""}`}
            />
            {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Mô tả</label>
            <input type="text" placeholder="VD: Giảm 20% cho đơn hàng mùa hè"
              value={form.description} onChange={(e) => set("description", e.target.value)}
              className="w-full border border-gray-200 focus:border-amber-400 rounded-xl px-3 py-2.5 text-sm outline-none transition" />
          </div>

          {/* Discount type + value */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Loại giảm giá *</label>
              <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                {(["percent", "fixed"] as const).map((t) => (
                  <button key={t} type="button"
                    onClick={() => set("discountType", t)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition
                      ${form.discountType === t ? "bg-amber-500 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
                    {t === "percent" ? <Percent size={12} /> : <DollarSign size={12} />}
                    {t === "percent" ? "Phần trăm" : "Cố định"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                Giá trị * {form.discountType === "percent" ? "(%)" : "(VNĐ)"}
              </label>
              <input type="number" min="0" placeholder={form.discountType === "percent" ? "20" : "50000"}
                value={form.discountValue}
                onChange={(e) => { set("discountValue", e.target.value); setErrors(p => ({ ...p, discountValue: "" })); }}
                className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none transition
                  ${errors.discountValue ? "border-red-300" : "border-gray-200 focus:border-amber-400"}`} />
              {errors.discountValue && <p className="text-red-500 text-xs mt-1">{errors.discountValue}</p>}
            </div>
          </div>

          {/* Min order + max discount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Đơn tối thiểu (VNĐ)</label>
              <input type="number" min="0" placeholder="0"
                value={form.minOrderValue} onChange={(e) => set("minOrderValue", e.target.value)}
                className="w-full border border-gray-200 focus:border-amber-400 rounded-xl px-3 py-2.5 text-sm outline-none transition" />
            </div>
            {form.discountType === "percent" && (
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Giảm tối đa (VNĐ)</label>
                <input type="number" min="0" placeholder="Không giới hạn"
                  value={form.maxDiscountAmount} onChange={(e) => set("maxDiscountAmount", e.target.value)}
                  className="w-full border border-gray-200 focus:border-amber-400 rounded-xl px-3 py-2.5 text-sm outline-none transition" />
              </div>
            )}
          </div>

          {/* Usage limit */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Số lượt dùng tối đa</label>
            <input type="number" min="0" placeholder="Không giới hạn"
              value={form.usageLimit} onChange={(e) => set("usageLimit", e.target.value)}
              className="w-full border border-gray-200 focus:border-amber-400 rounded-xl px-3 py-2.5 text-sm outline-none transition" />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Ngày bắt đầu</label>
              <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)}
                className="w-full border border-gray-200 focus:border-amber-400 rounded-xl px-3 py-2.5 text-sm outline-none transition" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Ngày hết hạn</label>
              <input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)}
                className="w-full border border-gray-200 focus:border-amber-400 rounded-xl px-3 py-2.5 text-sm outline-none transition" />
            </div>
          </div>

          {/* Active toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div className={`relative w-10 h-6 rounded-full transition-colors ${form.isActive ? "bg-amber-400" : "bg-gray-200"}`}
              onClick={() => set("isActive", !form.isActive)}>
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? "translate-x-4" : ""}`} />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {form.isActive ? "Đang hoạt động" : "Tạm dừng"}
            </span>
          </label>
        </div>

        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-300 transition">
            Huỷ
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {isEdit ? "Cập nhật" : "Tạo voucher"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function VouchersPage() {
  const [vouchers, setVouchers]   = useState<Voucher[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filterActive, setFilterActive] = useState<"" | "true" | "false">("");
  const [editTarget, setEditTarget]   = useState<Voucher | null | undefined>(undefined); // undefined = closed
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const [togglingId, setTogglingId]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminVoucherApi.getAll({ search: search || undefined, isActive: filterActive || undefined });
      setVouchers(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, filterActive]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa voucher này?")) return;
    setDeletingId(id);
    try { await adminVoucherApi.delete(id); await load(); }
    catch (e) { console.error(e); }
    finally { setDeletingId(null); }
  };

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    try { await adminVoucherApi.toggle(id); await load(); }
    catch (e) { console.error(e); }
    finally { setTogglingId(null); }
  };

  const now = new Date();

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Voucher</h1>
            <p className="text-sm text-gray-400 mt-0.5">Tạo và quản lý mã giảm giá cho khách hàng</p>
          </div>
          <button onClick={() => setEditTarget(null)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition">
            <Plus size={16} /> Thêm voucher
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] border border-gray-200 rounded-xl px-3 py-2 focus-within:border-amber-400 transition">
            <Search size={14} className="text-gray-400" />
            <input type="text" placeholder="Tìm theo mã voucher..."
              value={search} onChange={(e) => setSearch(e.target.value.toUpperCase())}
              className="outline-none text-sm w-full bg-transparent uppercase font-mono" />
          </div>
          <div className="flex rounded-xl border border-gray-200 overflow-hidden text-xs font-medium">
            {([["", "Tất cả"], ["true", "Đang bật"], ["false", "Tắt"]] as const).map(([val, label]) => (
              <button key={val} onClick={() => setFilterActive(val)}
                className={`px-3 py-2 transition ${filterActive === val ? "bg-amber-500 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <Loader2 size={24} className="animate-spin mr-2" /> Đang tải...
            </div>
          ) : vouchers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Tag size={40} className="mb-3 opacity-30" />
              <p>Chưa có voucher nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                    <th className="px-5 py-3.5">Mã</th>
                    <th className="px-5 py-3.5">Giảm giá</th>
                    <th className="px-5 py-3.5">Đơn tối thiểu</th>
                    <th className="px-5 py-3.5">Lượt dùng</th>
                    <th className="px-5 py-3.5">Hiệu lực</th>
                    <th className="px-5 py-3.5">Trạng thái</th>
                    <th className="px-5 py-3.5 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {vouchers.map((v) => {
                    const expired = v.endDate ? new Date(v.endDate) < now : false;
                    const notStarted = v.startDate ? new Date(v.startDate) > now : false;
                    const statusLabel = !v.isActive ? { label: "Tắt", color: "text-gray-500 bg-gray-100" }
                      : expired ? { label: "Hết hạn", color: "text-red-600 bg-red-50" }
                      : notStarted ? { label: "Chưa bắt đầu", color: "text-blue-600 bg-blue-50" }
                      : { label: "Đang hoạt động", color: "text-green-600 bg-green-50" };

                    return (
                      <tr key={v._id} className="hover:bg-amber-50/30 transition">
                        <td className="px-5 py-4">
                          <span className="font-mono font-bold text-amber-600 tracking-widest text-base">{v.code}</span>
                          {v.description && <p className="text-xs text-gray-400 mt-0.5 max-w-[160px] truncate">{v.description}</p>}
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-semibold text-gray-800">
                            {v.discountType === "percent"
                              ? `${v.discountValue}%`
                              : formatPrice(v.discountValue)}
                          </span>
                          {v.discountType === "percent" && v.maxDiscountAmount && (
                            <p className="text-xs text-gray-400">Tối đa {formatPrice(v.maxDiscountAmount)}</p>
                          )}
                        </td>
                        <td className="px-5 py-4 text-gray-500">
                          {v.minOrderValue > 0 ? formatPrice(v.minOrderValue) : "—"}
                        </td>
                        <td className="px-5 py-4 text-gray-500">
                          <span className="font-medium text-gray-700">{v.usageCount}</span>
                          {v.usageLimit ? <span className="text-gray-400">/{v.usageLimit}</span> : <span className="text-gray-400"> / ∞</span>}
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-400">
                          {v.startDate ? new Date(v.startDate).toLocaleDateString("vi-VN") : "—"}
                          {" → "}
                          {v.endDate ? new Date(v.endDate).toLocaleDateString("vi-VN") : "∞"}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusLabel.color}`}>
                            {statusLabel.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 justify-end">
                            <button onClick={() => handleToggle(v._id)} disabled={togglingId === v._id}
                              title={v.isActive ? "Tắt" : "Bật"}
                              className="text-gray-400 hover:text-amber-500 transition disabled:opacity-50">
                              {togglingId === v._id
                                ? <Loader2 size={16} className="animate-spin" />
                                : v.isActive ? <ToggleRight size={20} className="text-amber-500" /> : <ToggleLeft size={20} />}
                            </button>
                            <button onClick={() => setEditTarget(v)} title="Chỉnh sửa"
                              className="text-gray-400 hover:text-blue-500 transition">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => handleDelete(v._id)} disabled={deletingId === v._id}
                              title="Xóa" className="text-gray-400 hover:text-red-400 transition disabled:opacity-50">
                              {deletingId === v._id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {editTarget !== undefined && (
        <VoucherModal voucher={editTarget} onClose={() => setEditTarget(undefined)} onSave={load} />
      )}
    </AdminShell>
  );
}