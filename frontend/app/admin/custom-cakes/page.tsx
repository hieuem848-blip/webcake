"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import AdminShell from "../components/AdminShell";
import { adminCustomCakeApi, CustomCakeRequest, CUSTOM_STATUS } from "../../lib/adminApi";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function CustomCakesContent() {
  const searchParams = useSearchParams();
  const [requests, setRequests] = useState<CustomCakeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminCustomCakeApi.getAll({ status: statusFilter || undefined });
      setRequests(res);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const statuses = ["", "pending", "quoted", "accepted", "rejected", "completed"];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "Georgia, serif", color: "#1a1a1a" }}>Bánh Custom</h1>
        <p className="text-sm mt-0.5" style={{ color: "#888" }}>Tổng cộng {requests.length} yêu cầu</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 border w-fit" style={{ borderColor: "#e8ddd0" }}>
        {statuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: statusFilter === s ? "#C8A96A" : "transparent",
              color: statusFilter === s ? "white" : "#888",
            }}>
            {s ? (CUSTOM_STATUS[s]?.label ?? s) : "Tất cả"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#e8ddd0" }}>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#C8A96A", borderTopColor: "transparent" }} />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 text-gray-400">Không có yêu cầu nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#fdf6ec", borderBottom: "1px solid #e8ddd0" }}>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "#5a4a35" }}>Mã yêu cầu</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "#5a4a35" }}>Khách hàng</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "#5a4a35" }}>Mô tả</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "#5a4a35" }}>Trạng thái</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: "#5a4a35" }}>Ngày tạo</th>
                  <th className="text-right px-4 py-3 font-semibold" style={{ color: "#5a4a35" }}>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req, i) => {
                  const st = CUSTOM_STATUS[req.status] ?? { label: req.status, color: "text-gray-500 bg-gray-50 border-gray-200" };
                  return (
                    <tr key={req._id} style={{ borderBottom: i < requests.length - 1 ? "1px solid #f0e8dc" : "none" }}
                      className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: "#888" }}>#{req._id.slice(-8).toUpperCase()}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium" style={{ color: "#1a1a1a" }}>{req.user?.fullName ?? "—"}</p>
                        <p className="text-xs" style={{ color: "#aaa" }}>{req.user?.phone ?? ""}</p>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-sm line-clamp-2" style={{ color: "#666" }}>{req.description}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#888" }}>
                        {new Date(req.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/admin/custom-cakes/${req._id}`}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border hover:bg-amber-50 transition-colors"
                          style={{ borderColor: "#e0d0b8", color: "#5a4a35" }}>
                          Xem & Xử lý
                        </Link>
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
  );
}

export default function CustomCakesPage() {
  return (
    <AdminShell>
      <Suspense fallback={<div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#C8A96A", borderTopColor: "transparent" }} /></div>}>
        <CustomCakesContent />
      </Suspense>
    </AdminShell>
  );
}
