import { useEffect, useState } from "react";
import { adminApi } from "./adminApi.js";
import { formatMoney } from "./format.js";
import { apiUrl } from "../config/apiBase.js";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  shortDescription: "",
  price: "",
  compareAtPrice: "",
  images: "",
  category: "",
  stock: "",
  origin: "",
  badgeFresh: false,
  badgeSale: false,
  featured: false,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const [pr, cats] = await Promise.all([
        adminApi.products({ search: search.trim(), limit: 100 }),
        adminApi.categories(),
      ]);
      setProducts(pr.items || []);
      setTotal(pr.total || 0);
      setCategories(cats);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setForm({
      ...emptyForm,
      category: categories[0]?._id || "",
    });
    setModal("create");
  }

  function openEdit(p) {
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description || "",
      shortDescription: p.shortDescription || "",
      price: String(p.price),
      compareAtPrice: p.compareAtPrice != null ? String(p.compareAtPrice) : "",
      images: (p.images || []).join("\n"),
      category: p.category?._id || p.category || "",
      stock: String(p.stock ?? 0),
      origin: p.origin || "",
      badgeFresh: !!p.badgeFresh,
      badgeSale: !!p.badgeSale,
      featured: !!p.featured,
      _id: p._id,
    });
    setModal("edit");
  }

  async function onSave(e) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    try {
      const images = form.images
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const body = {
        name: form.name,
        slug: form.slug || undefined,
        description: form.description,
        shortDescription: form.shortDescription,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice === "" ? undefined : Number(form.compareAtPrice),
        images,
        category: form.category,
        stock: Number(form.stock) || 0,
        origin: form.origin,
        badgeFresh: form.badgeFresh,
        badgeSale: form.badgeSale,
        featured: form.featured,
      };
      if (modal === "create") {
        await adminApi.createProduct(body);
      } else {
        await adminApi.updateProduct(form._id, body);
      }
      setModal(null);
      await load();
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id) {
    if (!confirm("Xóa sản phẩm này?")) return;
    try {
      await adminApi.deleteProduct(id);
      await load();
    } catch (ex) {
      setErr(ex.message);
    }
  }

  async function onPickImages(e) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadingImages(true);
    setErr("");
    try {
      const lines = form.images
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      for (const file of files) {
        const { url } = await adminApi.uploadProductImage(file);
        if (url) lines.push(url);
      }
      setForm((f) => ({ ...f, images: lines.join("\n") }));
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setUploadingImages(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sản phẩm</h1>
          <p className="text-slate-500 text-sm mt-1">{total} sản phẩm</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-500 shadow-sm"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Thêm sản phẩm
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
            search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Tìm theo tên, slug…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none"
          />
        </div>
        <button
          type="button"
          onClick={load}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Tìm
        </button>
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
                  <th className="px-4 py-3 font-medium w-14">Ảnh</th>
                  <th className="px-4 py-3 font-medium">Tên</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Danh mục</th>
                  <th className="px-4 py-3 font-medium">Giá</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Tồn</th>
                  <th className="px-4 py-3 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-2">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden">
                        {p.images?.[0] ? (
                          <img src={apiUrl(p.images[0])} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <span className="material-symbols-outlined text-xl">image</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <p className="font-medium text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{p.slug}</p>
                    </td>
                    <td className="px-4 py-2 text-slate-600 hidden lg:table-cell">
                      {p.category?.name || "—"}
                    </td>
                    <td className="px-4 py-2 font-semibold tabular-nums">{formatMoney(p.price)}</td>
                    <td className="px-4 py-2 tabular-nums hidden md:table-cell">{p.stock}</td>
                    <td className="px-4 py-2 text-right space-x-1 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="p-2 rounded-lg text-teal-700 hover:bg-teal-50"
                        title="Sửa"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(p._id)}
                        className="p-2 rounded-lg text-rose-600 hover:bg-rose-50"
                        title="Xóa"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && products.length === 0 ? (
            <p className="p-8 text-center text-slate-500">Không có sản phẩm.</p>
          ) : null}
        </div>
      </div>

      {modal ? (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <button
            type="button"
            aria-label="Đóng"
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => !saving && setModal(null)}
          />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto border border-slate-200">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between z-10">
              <h2 className="font-bold text-lg text-slate-900">
                {modal === "create" ? "Thêm sản phẩm" : "Sửa sản phẩm"}
              </h2>
              <button
                type="button"
                onClick={() => !saving && setModal(null)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={onSave} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Tên</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/30 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Slug (tùy chọn)</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-teal-500/30 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Danh mục</label>
                <select
                  required
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/30 outline-none"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Giá</label>
                  <input
                    required
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Giá gốc</label>
                  <input
                    type="number"
                    min={0}
                    value={form.compareAtPrice}
                    onChange={(e) => setForm((f) => ({ ...f, compareAtPrice: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Tồn kho</label>
                <input
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Xuất xứ</label>
                <input
                  value={form.origin}
                  onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Ảnh sản phẩm</label>
                <p className="text-xs text-slate-500 mt-1 mb-2">
                  Tải từ máy (JPEG, PNG, GIF, WebP, tối đa 5MB/ảnh) hoặc dán URL bên dưới.
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-teal-300 bg-teal-50/50 text-teal-800 text-sm font-medium cursor-pointer hover:bg-teal-50">
                  <span className="material-symbols-outlined text-lg">upload</span>
                  {uploadingImages ? "Đang tải lên…" : "Chọn ảnh từ thiết bị"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    multiple
                    className="sr-only"
                    disabled={saving || uploadingImages}
                    onChange={onPickImages}
                  />
                </label>
                <label className="block text-xs font-semibold text-slate-500 uppercase mt-4">
                  URL ảnh (mỗi dòng — bổ sung hoặc chỉnh tay)
                </label>
                <textarea
                  value={form.images}
                  onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono outline-none"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Mô tả ngắn</label>
                <input
                  value={form.shortDescription}
                  onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Mô tả đầy đủ</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.badgeFresh}
                    onChange={(e) => setForm((f) => ({ ...f, badgeFresh: e.target.checked }))}
                  />
                  Tươi mới
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.badgeSale}
                    onChange={(e) => setForm((f) => ({ ...f, badgeSale: e.target.checked }))}
                  />
                  Sale
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                  />
                  Nổi bật
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-500 disabled:opacity-60"
                >
                  {saving ? "Đang lưu…" : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
