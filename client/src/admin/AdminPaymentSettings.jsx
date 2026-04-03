import { useEffect, useState } from "react";
import { adminApi } from "./adminApi.js";

const empty = {
  momoQrImageUrl: "",
  bankQrImageUrl: "",
  bankName: "",
  bankAccountNumber: "",
  bankAccountName: "",
  transferNote: "",
};

export default function AdminPaymentSettings() {
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
        const doc = await adminApi.getPaymentConfig();
        if (!cancelled) {
          setForm({
            momoQrImageUrl: doc.momoQrImageUrl || "",
            bankQrImageUrl: doc.bankQrImageUrl || "",
            bankName: doc.bankName || "",
            bankAccountNumber: doc.bankAccountNumber || "",
            bankAccountName: doc.bankAccountName || "",
            transferNote: doc.transferNote || "",
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
      await adminApi.updatePaymentConfig(form);
      setMsg("Đã lưu cấu hình.");
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
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Cấu hình thanh toán</h1>
      <p className="text-sm text-slate-600 mb-8">
        Ảnh QR và thông tin hiển thị cho khách khi chọn Momo hoặc Chuyển khoản ngân hàng ở trang thanh toán.
      </p>

      {err ? <p className="text-rose-600 text-sm mb-4">{err}</p> : null}
      {msg ? <p className="text-teal-700 text-sm mb-4">{msg}</p> : null}

      <form onSubmit={onSave} className="space-y-8 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Momo / ví</h2>
          <label className="block text-xs font-medium text-slate-500 mb-1">URL ảnh QR Momo</label>
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            value={form.momoQrImageUrl}
            onChange={(e) => setForm((f) => ({ ...f, momoQrImageUrl: e.target.value }))}
            placeholder="https://..."
          />
        </div>

        <div className="border-t border-slate-100 pt-8">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Chuyển khoản ngân hàng</h2>
          <label className="block text-xs font-medium text-slate-500 mb-1">URL ảnh QR ngân hàng</label>
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm mb-4"
            value={form.bankQrImageUrl}
            onChange={(e) => setForm((f) => ({ ...f, bankQrImageUrl: e.target.value }))}
            placeholder="https://..."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Tên ngân hàng</label>
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                value={form.bankName}
                onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Số tài khoản</label>
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                value={form.bankAccountNumber}
                onChange={(e) => setForm((f) => ({ ...f, bankAccountNumber: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Chủ tài khoản</label>
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                value={form.bankAccountName}
                onChange={(e) => setForm((f) => ({ ...f, bankAccountName: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Ghi chú chuyển khoản (nội dung CK)</label>
              <textarea
                rows={2}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                value={form.transferNote}
                onChange={(e) => setForm((f) => ({ ...f, transferNote: e.target.value }))}
                placeholder="Ví dụ: Ma don PQL-..."
              />
            </div>
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
