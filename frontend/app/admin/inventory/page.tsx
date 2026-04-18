'use client';
import { useState, useEffect, useCallback } from 'react';
import AdminShell from '../components/AdminShell';
import {
  adminInventoryApi, getAdminToken,
  Ingredient, InventoryLog, InventoryStats, ExpiryAlert, MovementType,
  INGREDIENT_CATEGORIES, IngredientCategory, LogsResponse,
} from '../../lib/adminApi';
import {
  Package, Plus, Minus, Trash2, AlertCircle, X, History,
  RefreshCw, Pencil, Download, Search, Filter, ChevronLeft,
  ChevronRight, AlertTriangle, TrendingDown, DollarSign, Calendar,
} from 'lucide-react';

// ── helpers ──────────────────────────────────────────────────────────────────
const fmtVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
const fmtDate = (d: string | Date | null | undefined) =>
  d ? new Date(d).toLocaleDateString('vi-VN') : '—';
const fmtDateTime = (d: string | Date) =>
  new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const today = () => new Date().toISOString().slice(0, 10);

const TYPE_META: Record<MovementType, { label: string; badge: string; btn: string }> = {
  import:   { label: 'Nhập kho',       badge: 'bg-green-100 text-green-800',   btn: 'bg-green-500 hover:bg-green-600' },
  export:   { label: 'Xuất kho',       badge: 'bg-blue-100 text-blue-800',     btn: 'bg-blue-500 hover:bg-blue-600' },
  spoilage: { label: 'Hủy/Hao hụt',   badge: 'bg-red-100 text-red-800',       btn: 'bg-red-500 hover:bg-red-600' },
  adjust:   { label: 'Điều chỉnh',    badge: 'bg-purple-100 text-purple-800',  btn: 'bg-purple-500 hover:bg-purple-600' },
};

// ─────────────────────────────────────────────────────────────────────────────
export default function InventoryPage() {
  const [tab, setTab] = useState<'stock' | 'logs' | 'expiry'>('stock');

  // ── data ──
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [logsData, setLogsData] = useState<LogsResponse>({ logs: [], total: 0, page: 1, totalPages: 1 });
  const [expiryAlerts, setExpiryAlerts] = useState<ExpiryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);

  // ── filters ──
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [logFilter, setLogFilter] = useState({ type: 'all', fromDate: '', toDate: '', ingredientId: '' });
  const [logPage, setLogPage] = useState(1);

  // ── add ingredient ──
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', unit: '', category: 'khac' as IngredientCategory, stock: '', minThreshold: '', costPrice: '', supplier: '', note: '' });

  // ── edit ingredient ──
  const [editIng, setEditIng] = useState<Ingredient | null>(null);
  const [editForm, setEditForm] = useState({ name: '', unit: '', category: 'khac' as IngredientCategory, minThreshold: '', costPrice: '', supplier: '', note: '' });

  // ── movement modal ──
  const [mvModal, setMvModal] = useState(false);
  const [mvIng, setMvIng] = useState<Ingredient | null>(null);
  const [mvType, setMvType] = useState<MovementType>('import');
  const [mvForm, setMvForm] = useState({ quantity: '', reason: '', costPrice: '', supplier: '', expiryDate: '', batchNote: '' });

  // ── ui ──
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // ── loaders ──
  const loadIngredients = useCallback(async () => {
  setTableLoading(true);
  try {
    const res = await adminInventoryApi.getAll({
      search: debouncedSearch || undefined, 
      category: filterCategory || undefined,
      lowStock: filterLowStock ? '1' : undefined,
    });
    setIngredients(res.ingredients);
  } finally {
    setTableLoading(false);
  }
}, [debouncedSearch, filterCategory, filterLowStock]);

  const loadStats = useCallback(async () => {
    const s = await adminInventoryApi.getStats();
    setStats(s);
  }, []);

  const loadLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const res = await adminInventoryApi.getLogs({
        type: logFilter.type !== 'all' ? logFilter.type : undefined,
        fromDate: logFilter.fromDate || undefined,
        toDate: logFilter.toDate || undefined,
        ingredientId: logFilter.ingredientId || undefined,
        page: logPage,
        limit: 20,
      });
      setLogsData(res);
    } finally { setLogsLoading(false); }
  }, [logFilter, logPage]);

  const loadExpiry = useCallback(async () => {
    const res = await adminInventoryApi.getExpiryAlerts();
    setExpiryAlerts(res.alerts);
  }, []);

  const loadAll = useCallback(async () => {
  setLoading(true);
  try {
    await Promise.all([
      loadStats(),
      loadExpiry(),
    ]);
  } finally {
    setLoading(false);
  }
}, [loadStats, loadExpiry]);

useEffect(() => {
  loadAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
  useEffect(() => { if (tab === 'logs') loadLogs(); }, [tab, loadLogs]);
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400); // delay 400ms

    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
  loadIngredients();
}, [debouncedSearch, filterCategory, filterLowStock]);
  // ── add ──
  const handleAdd = async () => {
    if (!addForm.name.trim() || !addForm.unit.trim()) { setError('Vui lòng điền tên và đơn vị'); return; }
    setSubmitting(true); setError('');
    try {
      await adminInventoryApi.create({
        name: addForm.name.trim(), unit: addForm.unit.trim(), category: addForm.category,
        stock: parseFloat(addForm.stock) || 0, minThreshold: parseFloat(addForm.minThreshold) || 0,
        costPrice: parseFloat(addForm.costPrice) || 0, supplier: addForm.supplier, note: addForm.note,
      });
      await loadAll();
      await loadIngredients();
      setShowAdd(false);
      setAddForm({ name: '', unit: '', category: 'khac', stock: '', minThreshold: '', costPrice: '', supplier: '', note: '' });
      showToast('✅ Đã thêm nguyên liệu!');
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Lỗi'); }
    finally { setSubmitting(false); }
  };

  // ── edit ──
  const openEdit = (ing: Ingredient) => {
    setEditIng(ing);
    setEditForm({ name: ing.name, unit: ing.unit, category: ing.category, minThreshold: String(ing.minThreshold), costPrice: String(ing.costPrice), supplier: ing.supplier, note: ing.note });
    setError('');
  };
  const handleEdit = async () => {
    if (!editIng) return;
    if (!editForm.name.trim() || !editForm.unit.trim()) { setError('Vui lòng điền tên và đơn vị'); return; }
    setSubmitting(true); setError('');
    try {
      await adminInventoryApi.update(editIng._id, {
        name: editForm.name.trim(), unit: editForm.unit.trim(), category: editForm.category,
        minThreshold: parseFloat(editForm.minThreshold) || 0,
        costPrice: parseFloat(editForm.costPrice) || 0,
        supplier: editForm.supplier, note: editForm.note,
      });
      await loadAll();
      await loadIngredients();
      setEditIng(null);
      showToast('✅ Đã cập nhật!');
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Lỗi'); }
    finally { setSubmitting(false); }
  };

  // ── delete ──
  const handleDelete = async (ing: Ingredient) => {
    if (!confirm(`Xoá nguyên liệu "${ing.name}"?`)) return;
    try { await adminInventoryApi.delete(ing._id); await loadAll(); await loadIngredients(); showToast(`🗑 Đã xoá "${ing.name}"`); }
    catch (e: unknown) { alert(e instanceof Error ? e.message : 'Lỗi'); }
  };

  // ── movement ──
  const openMovement = (ing: Ingredient, type: MovementType) => {
    setMvIng(ing); setMvType(type);
    setMvForm({ quantity: '', reason: '', costPrice: String(ing.costPrice || ''), supplier: ing.supplier || '', expiryDate: '', batchNote: '' });
    setError(''); setMvModal(true);
  };
  const handleMovement = async () => {
    if (!mvIng) return;
    const qty = parseFloat(mvForm.quantity);
    if (!qty || qty <= 0) { setError('Số lượng phải lớn hơn 0'); return; }
    if (mvType === 'spoilage' && !mvForm.reason.trim()) { setError('Vui lòng nhập lý do hủy'); return; }
    setSubmitting(true); setError('');
    try {
      await adminInventoryApi.movement(mvIng._id, {
        type: mvType, quantity: qty, reason: mvForm.reason,
        costPrice: mvType === 'import' ? parseFloat(mvForm.costPrice) || 0 : undefined,
        supplier: mvType === 'import' ? mvForm.supplier : undefined,
        expiryDate: mvType === 'import' && mvForm.expiryDate ? mvForm.expiryDate : undefined,
        batchNote: mvForm.batchNote || undefined,
      });
      await loadAll(); await loadIngredients(); if (tab === 'logs') await loadLogs();
      setMvModal(false); setMvIng(null);
      showToast(`✅ ${TYPE_META[mvType].label} ${qty} ${mvIng.unit} ${mvIng.name}`);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Lỗi'); }
    finally { setSubmitting(false); }
  };

  // ── export ──
  const handleExportStock = () => { const t = getAdminToken(); if (t) adminInventoryApi.exportCSV(t); };
  const handleExportLogs = () => {
    const t = getAdminToken();
    if (t) adminInventoryApi.exportLogsCSV(t, { fromDate: logFilter.fromDate, toDate: logFilter.toDate, type: logFilter.type !== 'all' ? logFilter.type : undefined });
  };

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) return (
    <AdminShell>
      <div className="flex items-center justify-center h-64">
        <div className="w-9 h-9 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </AdminShell>
  );

  const alertCount = (stats?.expiringSoonCount ?? 0) + (stats?.lowStock ?? 0);

  return (
    <AdminShell>
      <div className="min-h-full">

        {/* Toast */}
        {toast && (
          <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium">
            {toast}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý kho nguyên liệu</h1>
            <p className="text-gray-500 text-sm mt-1">Theo dõi tồn kho, nhập xuất, hạn sử dụng và chi phí</p>
          </div>
          <div>
            <button onClick={handleExportStock} className="flex items-center gap-1.5 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg px-3 py-2 transition">
              <Download className="w-4 h-4" /> Xuất Excel
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Tổng NVL', value: stats?.total ?? 0, icon: <Package className="w-6 h-6 text-purple-400" />, color: 'text-gray-800' },
            { label: 'Sắp hết hàng', value: stats?.lowStock ?? 0, icon: <TrendingDown className="w-6 h-6 text-orange-400" />, color: 'text-orange-500' },
            { label: 'Sắp hết hạn', value: stats?.expiringSoonCount ?? 0, icon: <AlertTriangle className="w-6 h-6 text-red-400" />, color: 'text-red-500' },
            { label: 'GD hôm nay', value: stats?.todayTransactions ?? 0, icon: <History className="w-6 h-6 text-blue-400" />, color: 'text-blue-600' },
            { label: 'Giá trị tồn kho', value: fmtVND(stats?.totalValue ?? 0), icon: <DollarSign className="w-6 h-6 text-emerald-400" />, color: 'text-emerald-600', wide: true },
          ].map(({ label, value, icon, color, wide }) => (
            <div key={label} className={`bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm ${wide ? 'col-span-2 md:col-span-1' : ''}`}>
              {icon}
              <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className={`font-bold text-base ${color}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-white rounded-xl border border-gray-100 p-1 shadow-sm w-fit">
          {([
            { key: 'stock', label: 'Tồn kho', icon: <Package className="w-4 h-4" /> },
            { key: 'logs', label: 'Lịch sử giao dịch', icon: <History className="w-4 h-4" /> },
            { key: 'expiry', label: `Hạn sử dụng${alertCount > 0 ? ` (${alertCount})` : ''}`, icon: <Calendar className="w-4 h-4" /> },
          ] as const).map(({ key, label, icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${tab === key ? 'bg-purple-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* ════════════════ TAB: STOCK ════════════════ */}
        {tab === 'stock' && (
          <>
            {/* Filters + Add button */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm nguyên liệu..."
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value);
                  }}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                />
              </div>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-200">
                <option value="">Tất cả danh mục</option>
                {(Object.entries(INGREDIENT_CATEGORIES) as [IngredientCategory, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={filterLowStock} onChange={e => setFilterLowStock(e.target.checked)} className="accent-purple-600" />
                Chỉ hiện sắp hết
              </label>
              <button onClick={() => { setShowAdd(true); setError(''); }}
                className="ml-auto bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-1.5 text-sm font-medium">
                <Plus className="w-4 h-4" /> Thêm nguyên liệu
              </button>
            </div>

            {/* Ingredient table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <tr>
                      {['Nguyên liệu', 'Danh mục', 'Tồn kho', 'Giá nhập', 'Giá trị tồn', 'Nhà CC', 'Hạn gần nhất', 'Thao tác'].map(h => (
                        <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {ingredients.length === 0 ? (
                      <tr><td colSpan={8} className="py-12 text-center text-gray-400">Chưa có nguyên liệu nào</td></tr>
                    ) : ingredients.map(ing => {
                      const low = ing.isLowStock;
                      const expSoon = ing.isExpiringSoon;
                      return (
                        <tr key={ing._id} className={`hover:bg-gray-50 ${low ? 'bg-red-50' : expSoon ? 'bg-yellow-50' : ''}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              {low && <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" title="Sắp hết hàng" />}
                              {expSoon && <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" title="Sắp hết hạn" />}
                              <div>
                                <p className={`font-medium text-sm ${low ? 'text-red-700' : 'text-gray-900'}`}>{ing.name}</p>
                                {ing.note && <p className="text-xs text-gray-400 truncate max-w-[140px]">{ing.note}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {INGREDIENT_CATEGORIES[ing.category] || ing.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`font-bold ${low ? 'text-red-600' : 'text-gray-800'}`}>{ing.stock}</span>
                            <span className="text-gray-400 text-xs ml-1">{ing.unit}</span>
                            {ing.minThreshold > 0 && (
                              <p className="text-xs text-gray-400">min: {ing.minThreshold}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {ing.costPrice > 0 ? fmtVND(ing.costPrice) : <span className="text-gray-300">—</span>}
                            <span className="text-xs text-gray-400">/{ing.unit}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-emerald-700">
                            {ing.costPrice > 0 ? fmtVND(ing.stock * ing.costPrice) : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                            {ing.supplier || <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {ing.nearestExpiry ? (
                              <span className={`text-xs font-medium ${ing.isExpiringSoon ? 'text-red-600' : 'text-gray-600'}`}>
                                {fmtDate(ing.nearestExpiry)}
                                {ing.isExpiringSoon && ' ⚠️'}
                              </span>
                            ) : <span className="text-gray-300 text-xs">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 flex-wrap min-w-[200px]">
                              <button onClick={() => openMovement(ing, 'import')} className="bg-green-500 text-white px-2.5 py-1 rounded-lg text-xs font-medium hover:bg-green-600 flex items-center gap-0.5"><Plus className="w-3 h-3" />Nhập</button>
                              <button onClick={() => openMovement(ing, 'export')} className="bg-blue-500 text-white px-2.5 py-1 rounded-lg text-xs font-medium hover:bg-blue-600 flex items-center gap-0.5"><Minus className="w-3 h-3" />Xuất</button>
                              <button onClick={() => openMovement(ing, 'spoilage')} className="bg-orange-500 text-white px-2.5 py-1 rounded-lg text-xs font-medium hover:bg-orange-600 flex items-center gap-0.5"><Trash2 className="w-3 h-3" />Hủy</button>
                              <button onClick={() => openMovement(ing, 'adjust')} className="bg-purple-500 text-white px-2.5 py-1 rounded-lg text-xs font-medium hover:bg-purple-600">Kiểm kê</button>
                              <button onClick={() => openEdit(ing)} className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-xs font-medium hover:bg-gray-200 flex items-center gap-0.5"><Pencil className="w-3 h-3" /></button>
                              <button onClick={() => handleDelete(ing)} className="text-red-400 hover:text-red-600 px-1.5 py-1 rounded hover:bg-red-50"><X className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ════════════════ TAB: LOGS ════════════════ */}
        {tab === 'logs' && (
          <>
            {/* Log filters */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Loại GD</label>
                <select value={logFilter.type} onChange={e => { setLogFilter(f => ({...f, type: e.target.value})); setLogPage(1); }}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-200">
                  <option value="all">Tất cả</option>
                  {(Object.entries(TYPE_META) as [MovementType, { label: string }][]).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Từ ngày</label>
                <input type="date" value={logFilter.fromDate} onChange={e => { setLogFilter(f => ({...f, fromDate: e.target.value})); setLogPage(1); }}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-200" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Đến ngày</label>
                <input type="date" value={logFilter.toDate} onChange={e => { setLogFilter(f => ({...f, toDate: e.target.value})); setLogPage(1); }}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-200" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nguyên liệu</label>
                <select value={logFilter.ingredientId} onChange={e => { setLogFilter(f => ({...f, ingredientId: e.target.value})); setLogPage(1); }}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-200 max-w-[180px]">
                  <option value="">Tất cả</option>
                  {ingredients.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
                </select>
              </div>
              <button onClick={loadLogs} className="flex items-center gap-1.5 text-sm border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 text-gray-600 transition">
                <Filter className="w-3.5 h-3.5" /> Lọc
              </button>
              <button onClick={handleExportLogs} className="ml-auto flex items-center gap-1.5 text-sm bg-green-600 text-white rounded-lg px-3 py-1.5 hover:bg-green-700 transition">
                <Download className="w-3.5 h-3.5" /> Xuất CSV
              </button>
            </div>

            {/* Logs table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {logsLoading ? (
                <div className="flex justify-center py-16"><div className="w-7 h-7 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" /></div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <tr>
                          {['Thời gian','Nguyên liệu','Loại','Số lượng','Tồn trước → sau','Giá nhập','Nhà CC','HSD lô','Lý do / Ghi chú','Người TH'].map(h => (
                            <th key={h} className="px-3 py-3 text-left whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {logsData.logs.length === 0 ? (
                          <tr><td colSpan={10} className="py-12 text-center text-gray-400">Không có giao dịch nào</td></tr>
                        ) : logsData.logs.map(log => (
                          <tr key={log._id} className="hover:bg-gray-50">
                            <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-500">{fmtDateTime(log.createdAt)}</td>
                            <td className="px-3 py-3 whitespace-nowrap font-medium text-gray-800">{log.ingredientName}</td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_META[log.type]?.badge}`}>
                                {TYPE_META[log.type]?.label}
                              </span>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap font-semibold">
                              {log.type === 'import' ? '+' : log.type === 'adjust' ? '=' : '-'}
                              {log.quantity} {log.ingredientUnit}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-500">
                              {log.stockBefore} → <span className="font-medium text-gray-800">{log.stockAfter}</span>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-600">
                              {log.costPrice > 0 ? fmtVND(log.costPrice) : '—'}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-500">{log.supplier || '—'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-xs">
                              {log.expiryDate ? (
                                <span className={new Date(log.expiryDate) <= new Date(Date.now() + 7*86400000) ? 'text-red-500 font-medium' : 'text-gray-600'}>
                                  {fmtDate(log.expiryDate)}
                                </span>
                              ) : '—'}
                            </td>
                            <td className="px-3 py-3 text-xs text-gray-500 max-w-[160px]">
                              <p className="truncate">{log.reason || '—'}</p>
                              {log.batchNote && <p className="text-gray-400 truncate">{log.batchNote}</p>}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-500">
                              {typeof log.createdBy === 'object' && log.createdBy ? (log.createdBy as { displayName: string }).displayName : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  {logsData.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">Tổng {logsData.total} giao dịch</p>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setLogPage(p => Math.max(1, p-1))} disabled={logPage === 1} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30">
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        {Array.from({ length: Math.min(logsData.totalPages, 7) }, (_, i) => i + 1).map(p => (
                          <button key={p} onClick={() => setLogPage(p)}
                            className={`w-7 h-7 rounded text-xs font-medium ${p === logPage ? 'bg-purple-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}>
                            {p}
                          </button>
                        ))}
                        <button onClick={() => setLogPage(p => Math.min(logsData.totalPages, p+1))} disabled={logPage === logsData.totalPages} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {/* ════════════════ TAB: EXPIRY ════════════════ */}
        {tab === 'expiry' && (
          <div className="space-y-4">
            {expiryAlerts.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-16 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Không có nguyên liệu nào sắp hết hạn trong 14 ngày tới</p>
                <p className="text-gray-400 text-sm mt-1">Hệ thống sẽ cảnh báo khi có lô hàng sắp hết hạn</p>
              </div>
            ) : expiryAlerts.map(alert => (
              <div key={alert.ingredient._id} className="bg-white rounded-xl border border-orange-200 shadow-sm overflow-hidden">
                <div className="bg-orange-50 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    <span className="font-semibold text-gray-800">{alert.ingredient.name}</span>
                    <span className="text-sm text-gray-500">— Tồn kho: <span className="font-medium">{alert.ingredient.stock} {alert.ingredient.unit}</span></span>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {alert.batches.map(batch => (
                    <div key={batch._id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          Số lượng: {batch.quantity} {alert.ingredient.unit}
                          {batch.batchNote && <span className="text-gray-500 font-normal"> — {batch.batchNote}</span>}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">HSD: <span className="font-medium">{fmtDate(batch.expiryDate)}</span></p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${batch.daysLeft <= 3 ? 'bg-red-100 text-red-700' : batch.daysLeft <= 7 ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          Còn {batch.daysLeft} ngày
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Low stock section */}
            {(stats?.lowStock ?? 0) > 0 && (
              <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
                <div className="bg-red-50 px-5 py-3 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  <span className="font-semibold text-gray-800">Nguyên liệu sắp hết ({stats?.lowStock} loại)</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {ingredients.filter(i => i.isLowStock).map(ing => (
                    <div key={ing._id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{ing.name}</p>
                        <p className="text-xs text-gray-400">{ing.supplier || 'Chưa có nhà cung cấp'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-600">{ing.stock} {ing.unit}</p>
                        <p className="text-xs text-gray-400">Ngưỡng: {ing.minThreshold} {ing.unit}</p>
                      </div>
                      <button onClick={() => openMovement(ing, 'import')} className="ml-4 bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-600">
                        Nhập ngay
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════ MODAL: THÊM ═══════════════ */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <h2 className="text-lg font-bold text-gray-800">Thêm nguyên liệu mới</h2>
                <button onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="px-6 py-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Tên nguyên liệu *</label>
                    <input type="text" placeholder="VD: Bột mì số 11" value={addForm.name} onChange={e => setAddForm(f => ({...f, name: e.target.value}))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Đơn vị *</label>
                    <input type="text" placeholder="kg, lít, quả, hộp..." value={addForm.unit} onChange={e => setAddForm(f => ({...f, unit: e.target.value}))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Danh mục</label>
                    <select value={addForm.category} onChange={e => setAddForm(f => ({...f, category: e.target.value as IngredientCategory}))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300">
                      {(Object.entries(INGREDIENT_CATEGORIES) as [IngredientCategory, string][]).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Tồn kho ban đầu</label>
                    <input type="number" min="0" step="any" placeholder="0" value={addForm.stock} onChange={e => setAddForm(f => ({...f, stock: e.target.value}))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Ngưỡng cảnh báo</label>
                    <input type="number" min="0" step="any" placeholder="0" value={addForm.minThreshold} onChange={e => setAddForm(f => ({...f, minThreshold: e.target.value}))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Giá nhập (VNĐ/đơn vị)</label>
                    <input type="number" min="0" placeholder="0" value={addForm.costPrice} onChange={e => setAddForm(f => ({...f, costPrice: e.target.value}))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Nhà cung cấp</label>
                    <input type="text" placeholder="Tên nhà CC..." value={addForm.supplier} onChange={e => setAddForm(f => ({...f, supplier: e.target.value}))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Ghi chú (cách bảo quản...)</label>
                    <input type="text" placeholder="VD: Bảo quản nơi khô ráo, thoáng mát" value={addForm.note} onChange={e => setAddForm(f => ({...f, note: e.target.value}))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                  </div>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
              <div className="px-6 py-4 border-t flex gap-2">
                <button onClick={handleAdd} disabled={submitting} className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition text-sm font-medium disabled:opacity-50">
                  {submitting ? 'Đang lưu...' : 'Thêm nguyên liệu'}
                </button>
                <button onClick={() => setShowAdd(false)} className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">Hủy</button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ MODAL: SỬA ═══════════════ */}
        {editIng && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <h2 className="text-lg font-bold text-gray-800">Sửa: {editIng.name}</h2>
                <button onClick={() => setEditIng(null)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="px-6 py-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Tên *</label>
                    <input type="text" value={editForm.name} onChange={e => setEditForm(f => ({...f, name: e.target.value}))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Đơn vị *</label>
                    <input type="text" value={editForm.unit} onChange={e => setEditForm(f => ({...f, unit: e.target.value}))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Danh mục</label>
                    <select value={editForm.category} onChange={e => setEditForm(f => ({...f, category: e.target.value as IngredientCategory}))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300">
                      {(Object.entries(INGREDIENT_CATEGORIES) as [IngredientCategory, string][]).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Ngưỡng cảnh báo</label>
                    <input type="number" min="0" step="any" value={editForm.minThreshold} onChange={e => setEditForm(f => ({...f, minThreshold: e.target.value}))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Giá nhập (VNĐ/đơn vị)</label>
                    <input type="number" min="0" value={editForm.costPrice} onChange={e => setEditForm(f => ({...f, costPrice: e.target.value}))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Nhà cung cấp</label>
                    <input type="text" value={editForm.supplier} onChange={e => setEditForm(f => ({...f, supplier: e.target.value}))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Ghi chú</label>
                    <input type="text" value={editForm.note} onChange={e => setEditForm(f => ({...f, note: e.target.value}))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                  </div>
                </div>
                <p className="text-xs text-gray-400 italic">* Tồn kho không sửa trực tiếp. Dùng chức năng "Kiểm kê" để điều chỉnh.</p>
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
              <div className="px-6 py-4 border-t flex gap-2">
                <button onClick={handleEdit} disabled={submitting} className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition text-sm font-medium disabled:opacity-50">
                  {submitting ? 'Đang lưu...' : 'Cập nhật'}
                </button>
                <button onClick={() => setEditIng(null)} className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">Hủy</button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ MODAL: MOVEMENT ═══════════════ */}
        {mvModal && mvIng && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">{TYPE_META[mvType].label}</h2>
                  <p className="text-sm text-gray-500">{mvIng.name} — Tồn: <span className="font-semibold text-gray-800">{mvIng.stock} {mvIng.unit}</span></p>
                </div>
                <button onClick={() => setMvModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>

              {/* Type selector */}
              <div className="px-6 pt-4">
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-4">
                  {(['import', 'export', 'spoilage', 'adjust'] as MovementType[]).map(t => (
                    <button key={t} onClick={() => { setMvType(t); setError(''); }}
                      className={`flex-1 py-1.5 rounded-md text-xs font-medium transition ${mvType === t ? `${TYPE_META[t].btn} text-white` : 'text-gray-500 hover:bg-white'}`}>
                      {TYPE_META[t].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-6 pb-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    {mvType === 'adjust' ? 'Tồn kho thực tế (sau kiểm kê) *' : `Số lượng (${mvIng.unit}) *`}
                  </label>
                  <input type="number" min="0" step="any" placeholder="0" value={mvForm.quantity}
                    onChange={e => setMvForm(f => ({...f, quantity: e.target.value}))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                  {mvType === 'adjust' && (
                    <p className="text-xs text-gray-400 mt-1">Nhập số lượng thực tế đếm được khi kiểm kê. Hệ thống sẽ tự điều chỉnh.</p>
                  )}
                </div>

                {mvType === 'import' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Giá nhập (VNĐ/{mvIng.unit})</label>
                        <input type="number" min="0" placeholder={String(mvIng.costPrice || 0)} value={mvForm.costPrice}
                          onChange={e => setMvForm(f => ({...f, costPrice: e.target.value}))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Nhà cung cấp</label>
                        <input type="text" placeholder={mvIng.supplier || 'Tên nhà CC...'} value={mvForm.supplier}
                          onChange={e => setMvForm(f => ({...f, supplier: e.target.value}))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Ngày hết hạn (HSD)</label>
                        <input type="date" min={today()} value={mvForm.expiryDate}
                          onChange={e => setMvForm(f => ({...f, expiryDate: e.target.value}))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Số lô / ghi chú lô</label>
                        <input type="text" placeholder="VD: Lô A-2026-04" value={mvForm.batchNote}
                          onChange={e => setMvForm(f => ({...f, batchNote: e.target.value}))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    Lý do {mvType === 'spoilage' && <span className="text-red-500">*</span>}
                    {mvType === 'adjust' && <span className="text-gray-400"> (ghi chú kiểm kê)</span>}
                  </label>
                  <input type="text"
                    placeholder={mvType === 'import' ? 'Nhập từ nhà cung cấp...' : mvType === 'export' ? 'Dùng làm bánh sinh nhật...' : mvType === 'spoilage' ? 'Hết hạn, hư hỏng...' : 'Kiểm kê định kỳ tháng 4...'}
                    value={mvForm.reason} onChange={e => setMvForm(f => ({...f, reason: e.target.value}))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                </div>

                {mvForm.quantity && parseFloat(mvForm.quantity) > 0 && mvType === 'import' && mvForm.costPrice && parseFloat(mvForm.costPrice) > 0 && (
                  <div className="bg-green-50 rounded-lg px-3 py-2 text-sm text-green-700">
                    💰 Tổng tiền lô hàng: <span className="font-bold">{fmtVND(parseFloat(mvForm.quantity) * parseFloat(mvForm.costPrice))}</span>
                  </div>
                )}

                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>

              <div className="px-6 py-4 border-t flex gap-2">
                <button onClick={handleMovement} disabled={submitting}
                  className={`flex-1 text-white py-2 rounded-lg transition text-sm font-medium disabled:opacity-50 ${TYPE_META[mvType].btn}`}>
                  {submitting ? 'Đang xử lý...' : 'Xác nhận'}
                </button>
                <button onClick={() => setMvModal(false)} className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">Hủy</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminShell>
  );
}