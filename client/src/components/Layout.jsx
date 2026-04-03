import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useEffect, useState } from "react";
import { api } from "../api";

const FOOTER_FALLBACK = {
  displayName: "PQLFood",
  footerTagline:
    "Thực phẩm tươi từ nguồn gốc rõ ràng. Rau củ, trái cây và thịt sạch cho mọi gia đình.",
  address: "123 Đường Sáng Tạo, Q1, TP.HCM",
  email: "contact@pqlfood.vn",
};

export default function Layout() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const [q, setQ] = useState("");
  const [contact, setContact] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    let cancelled = false;
    api
      .getContactConfig()
      .then((c) => {
        if (!cancelled) setContact(c);
      })
      .catch(() => {
        if (!cancelled) setContact({});
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const brand = (contact?.displayName || "").trim() || FOOTER_FALLBACK.displayName;
  const tagline =
    (contact?.footerTagline || "").trim() || FOOTER_FALLBACK.footerTagline;
  const addr = (contact?.address || "").trim() || FOOTER_FALLBACK.address;
  const mail = (contact?.email || "").trim() || FOOTER_FALLBACK.email;
  const tel = (contact?.phone || "").trim();

  function onSearch(e) {
    e.preventDefault();
    if (q.trim()) nav(`/?search=${encodeURIComponent(q.trim())}`);
    else nav("/");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <nav className="flex justify-between items-center w-full px-4 md:px-8 py-4 max-w-7xl mx-auto gap-4 flex-wrap">
          <div className="flex items-center gap-6 md:gap-12">
            <Link
              to="/"
              className="text-2xl font-black text-primary-container font-headline tracking-tighter"
            >
              PQLFood
            </Link>
            <ul className="hidden md:flex items-center gap-6 lg:gap-8">
              <li>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `font-label text-sm pb-1 border-b-2 transition-colors ${
                      isActive
                        ? "text-primary-container font-bold border-primary-container"
                        : "text-slate-600 border-transparent hover:text-primary-container"
                    }`
                  }
                >
                  Trang chủ
                </NavLink>
              </li>
              <li>
                <a
                  href="/#danh-muc"
                  className="text-slate-600 hover:text-primary-container font-label text-sm transition-colors"
                >
                  Danh mục
                </a>
              </li>
              <li>
                <NavLink
                  to="/ve-chung-toi"
                  className={({ isActive }) =>
                    `font-label text-sm pb-1 border-b-2 transition-colors ${
                      isActive
                        ? "text-primary-container font-bold border-primary-container"
                        : "text-slate-600 border-transparent hover:text-primary-container"
                    }`
                  }
                >
                  Về chúng tôi
                </NavLink>
              </li>
            </ul>
          </div>
          <div className="flex items-center gap-3 md:gap-6 flex-1 justify-end min-w-[200px]">
            <form
              onSubmit={onSearch}
              className="hidden lg:flex items-center bg-surface-container-highest/40 px-4 py-2 rounded-xl focus-within:bg-surface-container-lowest transition-all max-w-xs w-full"
            >
              <span className="material-symbols-outlined text-outline text-sm mr-2">search</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm w-full font-body outline-none"
                placeholder="Tìm kiếm thực phẩm..."
              />
            </form>
            <div className="flex items-center gap-2 md:gap-4 text-primary-container">
              {user ? (
                <Link
                  to="/tai-khoan"
                  className="hover:scale-105 transition-transform hidden sm:inline text-sm font-label max-w-[120px] truncate"
                  title={user.email}
                >
                  {user.name}
                </Link>
              ) : null}
              <Link to={user ? "/tai-khoan" : "/dang-nhap"} className="hover:scale-105 transition-transform">
                <span className="material-symbols-outlined">person</span>
              </Link>
              <Link to="/gio-hang" className="hover:scale-105 transition-transform relative">
                <span className="material-symbols-outlined">shopping_cart</span>
                {count > 0 ? (
                  <span className="absolute -top-2 -right-2 bg-error text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {count > 9 ? "9+" : count}
                  </span>
                ) : null}
              </Link>
            </div>
            <Link
              to="/gio-hang"
              className="hidden sm:inline-block bg-primary-container text-on-primary px-4 md:px-6 py-2.5 rounded-xl font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-primary-container/20 whitespace-nowrap"
            >
              Mua ngay
            </Link>
          </div>
        </nav>
      </header>
      <main className="flex-1 pt-24">
        <Outlet />
      </main>
      <footer className="bg-slate-100 w-full pt-16 pb-8 mt-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-8 max-w-7xl mx-auto">
          <div className="space-y-6">
            <Link to="/" className="text-xl font-black text-primary-container font-headline">
              {brand}
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed">{tagline}</p>
          </div>
          <div>
            <h4 className="font-headline text-lg font-bold text-primary-container mb-4">Thông tin</h4>
            <ul className="space-y-3 text-slate-500 text-sm">
              <li>
                <Link to="/ve-chung-toi" className="hover:text-primary-container">
                  Về chúng tôi & Liên hệ
                </Link>
              </li>
              <li>Chính sách bảo mật</li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline text-lg font-bold text-primary-container mb-4">Hỗ trợ</h4>
            <ul className="space-y-3 text-slate-500 text-sm">
              <li>Câu hỏi thường gặp</li>
              <li>Chính sách đổi trả</li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline text-lg font-bold text-primary-container mb-4">Liên hệ</h4>
            <p className="text-sm text-slate-500 whitespace-pre-line">{addr}</p>
            <p className="text-sm text-slate-500 mt-2">
              <a href={`mailto:${mail}`} className="hover:text-primary-container">
                {mail}
              </a>
            </p>
            {tel ? (
              <p className="text-sm text-slate-500 mt-2">
                <a href={`tel:${tel.replace(/\s/g, "")}`} className="hover:text-primary-container">
                  {tel}
                </a>
              </p>
            ) : null}
          </div>
        </div>
        <div className="mt-16 pt-8 text-center text-slate-400 text-xs px-4">
          © {new Date().getFullYear()} PQLFood
          {user ? (
            <button
              type="button"
              onClick={logout}
              className="block mx-auto mt-2 text-primary-container hover:underline"
            >
              Đăng xuất
            </button>
          ) : null}
        </div>
      </footer>
    </div>
  );
}
