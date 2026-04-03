import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";

const nav = [
  { to: "/quan-tri", end: true, label: "Tổng quan", icon: "dashboard" },
  { to: "/quan-tri/san-pham", label: "Sản phẩm", icon: "inventory_2" },
  { to: "/quan-tri/danh-muc", label: "Danh mục", icon: "category" },
  { to: "/quan-tri/don-hang", label: "Đơn hàng", icon: "receipt_long" },
  { to: "/quan-tri/thanh-toan", label: "Thanh toán", icon: "qr_code_2" },
  { to: "/quan-tri/lien-he", label: "Liên hệ", icon: "contact_mail" },
];

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="admin-app min-h-screen bg-slate-100 text-slate-900 flex">
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 flex flex-col
          transition-transform duration-200 ease-out shadow-xl
          lg:static lg:translate-x-0 lg:shadow-none
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="h-16 flex items-center gap-2 px-5 border-b border-white/10">
          <span className="material-symbols-outlined text-teal-400 text-2xl">eco</span>
          <div>
            <Link to="/quan-tri" className="font-bold text-white tracking-tight block leading-tight">
              PQLFood
            </Link>
            <span className="text-[10px] uppercase tracking-widest text-teal-400/90 font-semibold">
              Quản trị
            </span>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors
                ${isActive
                  ? "bg-teal-500/15 text-teal-300 border border-teal-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"}`
              }
            >
              <span className="material-symbols-outlined text-[22px] opacity-90">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 text-xs text-slate-500">
          <p className="truncate text-slate-400 mb-2">{admin?.email}</p>
          <Link
            to="/"
            className="text-teal-400/90 hover:text-teal-300 font-medium block mb-2"
          >
            ← Về cửa hàng
          </Link>
          <button
            type="button"
            onClick={logout}
            className="text-rose-400 hover:text-rose-300 font-medium"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Đóng menu"
          className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        <header className="h-14 lg:h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20 shadow-sm/50">
          <button
            type="button"
            className="lg:hidden p-2 -ml-1 rounded-lg text-slate-600 hover:bg-slate-100"
            onClick={() => setMobileOpen(true)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex-1 lg:flex-none" />
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-slate-500">Xin chào,</span>
            <span className="text-sm font-semibold text-slate-800 truncate max-w-[140px]">
              {admin?.name}
            </span>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-teal-600 to-slate-800 text-white flex items-center justify-center text-sm font-bold">
              {(admin?.name || "A").charAt(0)}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
