import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "./adminApi.js";
import { formatMoney, formatDate } from "./format.js";

const statusLabels = {
  processing: "Xử lý",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  in_transit: "Đang giao",
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    adminApi
      .dashboard()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setErr(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (err) {
    return <p className="text-rose-600 text-sm">{err}</p>;
  }
  if (!data) {
    return (
      <div className="flex items-center gap-3 text-slate-500">
        <span className="material-symbols-outlined animate-spin">progress_activity</span>
        Đang tải…
      </div>
    );
  }

  const cards = [
    { label: "Sản phẩm", value: data.productCount, icon: "inventory_2", color: "teal" },
    { label: "Danh mục", value: data.categoryCount, icon: "category", color: "violet" },
    { label: "Đơn hàng", value: data.orderCount, icon: "receipt_long", color: "amber" },
    { label: "Khách hàng", value: data.userCount, icon: "group", color: "sky" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tổng quan</h1>
        <p className="text-slate-500 text-sm mt-1">Doanh thu tích lũy (đơn không hủy)</p>
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-teal-600 to-slate-800 text-white p-6 sm:p-8 shadow-lg">
        <p className="text-teal-100/90 text-sm font-medium uppercase tracking-wider">Tổng giá trị đơn</p>
        <p className="text-3xl sm:text-4xl font-extrabold mt-2 tabular-nums">{formatMoney(data.revenue)}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500 font-medium">{c.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{c.value}</p>
              </div>
              <div
                className={`h-11 w-11 rounded-xl flex items-center justify-center
                  ${c.color === "teal" ? "bg-teal-100 text-teal-700" : ""}
                  ${c.color === "violet" ? "bg-violet-100 text-violet-700" : ""}
                  ${c.color === "amber" ? "bg-amber-100 text-amber-800" : ""}
                  ${c.color === "sky" ? "bg-sky-100 text-sky-800" : ""}
                `}
              >
                <span className="material-symbols-outlined">{c.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.byStatus && Object.keys(data.byStatus).length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">Đơn theo trạng thái</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.byStatus).map(([k, v]) => (
              <span
                key={k}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm"
              >
                <span className="font-medium">{statusLabels[k] || k}</span>
                <span className="tabular-nums text-slate-500">{v}</span>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Đơn gần đây</h2>
          <Link to="/quan-tri/don-hang" className="text-sm font-semibold text-teal-600 hover:text-teal-500">
            Xem tất cả
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100 bg-slate-50/80">
                <th className="px-5 py-3 font-medium">Mã</th>
                <th className="px-5 py-3 font-medium hidden md:table-cell">Khách</th>
                <th className="px-5 py-3 font-medium">Tổng</th>
                <th className="px-5 py-3 font-medium">Trạng thái</th>
                <th className="px-5 py-3 font-medium hidden sm:table-cell">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {(data.recentOrders || []).map((o) => (
                <tr key={o._id} className="border-b border-slate-50 hover:bg-slate-50/60">
                  <td className="px-5 py-3">
                    <Link
                      to={`/quan-tri/don-hang/${o._id}`}
                      className="font-mono text-teal-700 hover:underline"
                    >
                      {o.orderCode}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-600 hidden md:table-cell">
                    {o.user?.name || o.user?.email || "—"}
                  </td>
                  <td className="px-5 py-3 font-semibold tabular-nums">{formatMoney(o.total)}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                      {statusLabels[o.status] || o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 hidden sm:table-cell whitespace-nowrap">
                    {formatDate(o.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(data.recentOrders || []).length === 0 ? (
            <p className="px-5 py-8 text-center text-slate-500 text-sm">Chưa có đơn.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
