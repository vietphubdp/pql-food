import { useEffect, useState } from "react";
import { adminApi } from "./adminApi.js";

const empty = {
  displayName: "",
  footerTagline: "",
  email: "",
  phone: "",
  hotline: "",
  address: "",
  openingHours: "",
  zalo: "",
  facebookUrl: "",
};

export default function AdminContactSettings() {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const doc = await adminApi.getContactConfig();
        if (!cancelled) {
          setForm({
            displayName: doc.displayName ?? "",
            footerTagline: doc.footerTagline ?? "",
            email: doc.email ?? "",
            phone: doc.phone ?? "",
            hotline: doc.hotline ?? "",
            address: doc.address ?? "",
            openingHours: doc.openingHours ?? "",
            zalo: doc.zalo ?? "",
            facebookUrl: doc.facebookUrl ?? "",
          });
        }
      } catch (e) {
        if (!cancelled) setErr(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSave(e) {
    e.preventDefault();
    setMsg("");
    setErr("");
    setSaving(true);
    try {
      await adminApi.updateContactConfig(form);
      setMsg("Đã lưu thông tin liên hệ.");
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-slate-500">Đang tải…</p>;
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Thông tin liên hệ</h1>
      <p className="text-sm text-slate-600 mb-8">
        Hiển thị ở chân trang cửa hàng và trang <strong>Về chúng tôi &amp; Liên hệ</strong>.
      </p>

      {err ? <p className="text-rose-600 text-sm mb-4">{err}</p> : null}
      {msg ? <p className="text-teal-700 text-sm mb-4">{msg}</p> : null}

      <form onSubmit={onSave} className="space-y-6 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Tên hiển thị (footer)</label>
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            value={form.displayName}
            onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
            placeholder="PQLFood"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Mô tả ngắn dưới logo (footer)</label>
          <textarea
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            value={form.footerTagline}
            onChange={(e) => setForm((f) => ({ ...f, footerTagline: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="contact@pqlfood.vn"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Điện thoại</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="028 1234 5678"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Hotline (trang liên hệ)</label>
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            value={form.hotline}
            onChange={(e) => setForm((f) => ({ ...f, hotline: e.target.value }))}
            placeholder="1900 xxxx — để trống sẽ dùng số Điện thoại"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Địa chỉ (footer + trang liên hệ)</label>
          <textarea
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            placeholder="Số nhà, quận, thành phố…"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Giờ làm việc (tùy chọn)</label>
          <textarea
            rows={2}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            value={form.openingHours}
            onChange={(e) => setForm((f) => ({ ...f, openingHours: e.target.value }))}
            placeholder="Thứ Hai – Chủ Nhật: 8:00 – 21:00"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Zalo (số hoặc link)</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
              value={form.zalo}
              onChange={(e) => setForm((f) => ({ ...f, zalo: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Facebook (URL)</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
              value={form.facebookUrl}
              onChange={(e) => setForm((f) => ({ ...f, facebookUrl: e.target.value }))}
              placeholder="https://facebook.com/..."
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-teal-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-teal-700 disabled:opacity-60"
        >
          {saving ? "Đang lưu…" : "Lưu cấu hình"}
        </button>
      </form>
    </div>
  );
}
