import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { adminApi } from "./adminApi.js";
import { formatMoney, formatDate } from "./format.js";

const statusLabels = {
  processing: "Đang xử lý",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  in_transit: "Đang giao",
};

const shippingMethodLabels = {
  standard: "Giao tiêu chuẩn",
  express: "Giao nhanh 2h",
};

export default function AdminOrderDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const o = await adminApi.order(id);
      setOrder(o);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function patchStatus(status) {
    setSaving(true);
    setErr("");
    try {
      await adminApi.patchOrder(id, { status, timelineNote: note || `Đổi trạng thái: ${status}` });
      setNote("");
      await load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeOrder() {
    if (!order) return;
    if (!confirm(`Xóa đơn ${order.orderCode}? Không thể hoàn tác.`)) return;
    setErr("");
    try {
      await adminApi.deleteOrder(id);
      nav("/quan-tri/don-hang");
    } catch (e) {
      setErr(e.message);
    }
  }

  if (loading) {
    return <p className="text-slate-500">Đang tải…</p>;
  }
  if (err || !order) {
    return (
      <p className="text-rose-600">
        {err || "Không tìm thấy"}{" "}
        <Link to="/quan-tri/don-hang" className="text-teal-600 underline">
          Quay lại
        </Link>
      </p>
    );
  }

  const shipAddr = order.shippingAddress || {};
  const showShippingDetails =
    order.shippingMethod ||
    shipAddr.fullName ||
    shipAddr.phone ||
    shipAddr.address ||
    shipAddr.note;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link to="/quan-tri/don-hang" className="text-sm text-teal-600 font-medium hover:underline">
            ← Danh sách đơn
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-2 font-mono">{order.orderCode}</h1>
          <p className="text-slate-500 text-sm">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex flex-col sm:items-end gap-2">
          <span className="inline-flex px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-sm font-medium w-fit">
            {statusLabels[order.status] || order.status}
          </span>
          <button
            type="button"
            onClick={removeOrder}
            className="text-sm font-semibold text-rose-600 hover:text-rose-700 border border-rose-200 rounded-xl px-4 py-2 hover:bg-rose-50 w-fit"
          >
            Xóa đơn hàng
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-3">Tài khoản đặt hàng</h2>
          <p className="text-sm text-slate-700">{order.user?.name || "—"}</p>
          <p className="text-sm text-slate-500">{order.user?.email}</p>
          {order.user?.phone ? (
            <p className="text-sm text-slate-500">SĐT hồ sơ: {order.user.phone}</p>
          ) : null}
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-3">Cập nhật trạng thái</h2>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ghi chú (tùy chọn)"
            rows={2}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm mb-3 outline-none focus:ring-2 focus:ring-teal-500/30"
          />
          <div className="flex flex-wrap gap-2">
            {["processing", "in_transit", "completed", "cancelled"].map((s) => (
              <button
                key={s}
                type="button"
                disabled={saving}
                onClick={() => patchStatus(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 hover:bg-teal-100 hover:text-teal-900 disabled:opacity-50"
              >
                {statusLabels[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showShippingDetails ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">Thông tin giao hàng (khách nhập)</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            {order.shippingMethod ? (
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Phương thức giao
                </dt>
                <dd className="text-slate-900 mt-1">
                  {shippingMethodLabels[order.shippingMethod] || order.shippingMethod}
                </dd>
              </div>
            ) : null}
            {shipAddr.fullName ? (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Họ tên</dt>
                <dd className="text-slate-900 mt-1">{shipAddr.fullName}</dd>
              </div>
            ) : null}
            {shipAddr.phone ? (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Điện thoại</dt>
                <dd className="text-slate-900 mt-1">{shipAddr.phone}</dd>
              </div>
            ) : null}
            {shipAddr.address ? (
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Địa chỉ</dt>
                <dd className="text-slate-900 mt-1">{shipAddr.address}</dd>
              </div>
            ) : null}
            {shipAddr.note ? (
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Ghi chú & thông tin kèm
                </dt>
                <dd className="text-slate-700 mt-1 whitespace-pre-wrap leading-relaxed">{shipAddr.note}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : null}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 font-semibold text-slate-800">Sản phẩm</div>
        <ul className="divide-y divide-slate-100">
          {(order.items || []).map((line, i) => (
            <li key={i} className="px-5 py-3 flex gap-4">
              <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                {line.image ? (
                  <img src={line.image} alt="" className="w-full h-full object-cover" />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900">{line.name}</p>
                <p className="text-xs text-slate-500">
                  {formatMoney(line.price)} × {line.quantity}
                </p>
              </div>
              <p className="font-semibold tabular-nums">{formatMoney(line.price * line.quantity)}</p>
            </li>
          ))}
        </ul>
        <div className="px-5 py-4 bg-slate-50 space-y-1 text-sm border-t border-slate-100">
          <div className="flex justify-between">
            <span className="text-slate-600">Tạm tính</span>
            <span className="font-medium">{formatMoney(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Phí ship</span>
            <span className="font-medium">
              {order.shipping === 0 ? "Miễn phí" : formatMoney(order.shipping)}
            </span>
          </div>
          <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-200">
            <span>Tổng</span>
            <span>{formatMoney(order.total)}</span>
          </div>
        </div>
      </div>

      {order.timeline?.length ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-3">Lịch sử</h2>
          <ul className="space-y-3 text-sm">
            {order.timeline.map((t, i) => (
              <li key={i} className="border-l-2 border-teal-200 pl-3">
                <p className="font-medium text-slate-800">{t.label}</p>
                <p className="text-slate-600">{t.detail}</p>
                <p className="text-xs text-slate-400">{formatDate(t.at)}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
