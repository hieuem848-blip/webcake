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
      const res = await adminCustomCakeApi.getAll({
        status: statusFilter || undefined,
      });
      setRequests(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const STATUS_TABS = [
    { value: "", label: "Tất cả" },
    { value: "pending", label: "Chờ xử lý" },
    { value: "quoted", label: "Đã báo giá" },
    { value: "accepted", label: "Đã chấp nhận" },
    { value: "rejected", label: "Từ chối" },
    { value: "completed", label: "Hoàn thành" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Bánh Custom</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Tổng cộng{" "}
          <span className="font-semibold text-gray-600">
            {requests.length}
          </span>{" "}
          yêu cầu
        </p>
      </div>

      {/* Status Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                statusFilter === tab.value
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-300">
            <svg
              width="48"
              height="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="2" />
            </svg>
            <p className="mt-3 text-sm">Không có yêu cầu nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Mã yêu cầu
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Khách hàng
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Mô tả
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Trạng thái
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Ngày tạo
                  </th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Chi tiết
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {requests.map((req) => {
                  const st =
                    CUSTOM_STATUS[req.status] ?? {
                      label: req.status,
                      color: "text-gray-500 bg-gray-50 border-gray-200",
                    };

                  return (
                    <tr
                      key={req._id}
                      className="hover:bg-amber-50/40 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                          #{req._id.slice(-8).toUpperCase()}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-800 text-sm">
                          {req.user?.fullName ?? "—"}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {req.user?.phone ?? ""}
                        </p>
                      </td>

                      <td className="px-5 py-4 max-w-xs">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {req.description}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${st.color}`}
                        >
                          {st.label}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs text-gray-400">
                        {new Date(req.createdAt).toLocaleDateString("vi-VN")}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/custom-cakes/${req._id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-100 text-gray-600 hover:bg-amber-100 hover:text-amber-700 transition-colors"
                        >
                          Xem
                          <svg
                            width="12"
                            height="12"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
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
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <CustomCakesContent />
      </Suspense>
    </AdminShell>
  );
}