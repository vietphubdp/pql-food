import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "./adminApi.js";
import { formatMoney, formatDate } from "./format.js";

const statuses = [
  { value: "", label: "Tất cả" },
  { value: "processing", label: "Đang xử lý" },
  { value: "in_transit", label: "Đang giao" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
];

export default function AdminOrders() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [updating, setUpdating] = useState(null);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const r = await adminApi.orders({
        status: status || undefined,
        limit: 80,
      });
      setItems(r.items || []);
      setTotal(r.total || 0);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function changeStatus(id, newStatus) {
    setUpdating(id);
    setErr("");
    try {
      await adminApi.patchOrder(id, {
        status: newStatus,
        timelineNote: `Trạng thái: ${newStatus}`,
      });
      await load();
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setUpdating(null);
    }
  }

  async function removeOrder(id, orderCode) {
    if (!confirm(`Xóa đơn ${orderCode}? Không thể hoàn tác.`)) return;
    setErr("");
    try {
      await adminApi.deleteOrder(id);
      await load();
    } catch (ex) {
      setErr(ex.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Đơn hàng</h1>
          <p className="text-slate-500 text-sm mt-1">{total} đơn</p>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-teal-500/30 outline-none max-w-xs"
        >
          {statuses.map((s) => (
            <option key={s.value || "all"} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {err ? <p className="text-rose-600 text-sm">{err}</p> : null}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <p className="p-8 text-center text-slate-500">Đang tải…</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 bg-slate-50/80 border-b border-slate-100">
                  <th className="px-4 py-3 font-medium">Mã</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Khách</th>
                  <th className="px-4 py-3 font-medium">Tổng</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Thời gian</th>
                  <th className="px-4 py-3 font-medium text-right whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map((o) => (
                  <tr key={o._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-2 font-mono text-teal-700 font-medium">{o.orderCode}</td>
                    <td className="px-4 py-2 text-slate-600 hidden md:table-cell">
                      {o.user?.name || o.user?.email || "—"}
                    </td>
                    <td className="px-4 py-2 font-semibold tabular-nums">{formatMoney(o.total)}</td>
                    <td className="px-4 py-2">
                      <select
                        value={o.status}
                        disabled={updating === o._id}
                        onChange={(e) => changeStatus(o._id, e.target.value)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium bg-white max-w-[130px]"
                      >
                        <option value="processing">Xử lý</option>
                        <option value="in_transit">Đang giao</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Hủy</option>
                      </select>
                    </td>
                    <td className="px-4 py-2 text-slate-500 whitespace-nowrap hidden lg:table-cell">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="inline-flex items-center gap-1 justify-end flex-wrap">
                        <Link
                          to={`/quan-tri/don-hang/${o._id}`}
                          className="text-teal-600 font-semibold hover:underline text-xs sm:text-sm px-1"
                        >
                          Xem
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeOrder(o._id, o.orderCode)}
                          className="text-rose-600 hover:underline text-xs sm:text-sm font-semibold px-1"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && items.length === 0 ? (
            <p className="p-8 text-center text-slate-500">Không có đơn.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
