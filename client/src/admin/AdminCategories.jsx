import { useEffect, useState } from "react";
import { adminApi } from "./adminApi.js";

export default function AdminCategories() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("eco");
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const cats = await adminApi.categories();
      setItems(cats);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await adminApi.createCategory({ name: name.trim(), icon: icon || "shopping_basket" });
      setName("");
      setIcon("eco");
      await load();
    } catch (ex) {
      setErr(ex.message);
    }
  }

  async function onUpdate(id) {
    try {
      await adminApi.updateCategory(id, {
        name: editName.trim(),
        icon: editIcon,
      });
      setEditing(null);
      await load();
    } catch (ex) {
      setErr(ex.message);
    }
  }

  async function onDelete(id) {
    if (!confirm("Xóa danh mục? (Không được nếu còn sản phẩm)")) return;
    try {
      await adminApi.deleteCategory(id);
      await load();
    } catch (ex) {
      setErr(ex.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Danh mục</h1>
        <p className="text-slate-500 text-sm mt-1">Icon dùng tên Material Symbols (ví dụ eco, set_meal)</p>
      </div>

      {err ? <p className="text-rose-600 text-sm">{err}</p> : null}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Thêm danh mục</h2>
        <form onSubmit={onCreate} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên danh mục"
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500/30 outline-none"
          />
          <input
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="Icon"
            className="w-full sm:w-40 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-mono outline-none"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-500"
          >
            Thêm
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-slate-500">Đang tải…</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((c) => (
              <li
                key={c._id}
                className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50/80"
              >
                {editing === c._id ? (
                  <>
                    <div className="flex-1 flex flex-col sm:flex-row gap-2">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      />
                      <input
                        value={editIcon}
                        onChange={(e) => setEditIcon(e.target.value)}
                        className="sm:w-36 rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onUpdate(c._id)}
                        className="px-3 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold"
                      >
                        Lưu
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(null)}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      >
                        Hủy
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                        <span className="material-symbols-outlined text-2xl">{c.icon || "shopping_basket"}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">{c.name}</p>
                        <p className="text-xs text-slate-400 font-mono truncate">{c.slug}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(c._id);
                          setEditName(c.name);
                          setEditIcon(c.icon || "");
                        }}
                        className="p-2 rounded-lg text-teal-700 hover:bg-teal-50"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(c._id)}
                        className="p-2 rounded-lg text-rose-600 hover:bg-rose-50"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
