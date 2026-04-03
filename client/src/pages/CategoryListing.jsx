import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { useCart } from "../context/CartContext.jsx";

const BANNER_DEFAULT =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD-FNfU45dMbTIij_dPNwJa7CeZCCYRNkmh5GC2QkcSD5JrpeHHIfK-lT6PL8PhH62oTa3PG1ycJC-zOqs7u6YcA5bkELN4UpEj3Nqg1GXtTdg8sPixV7sn00AAYMomvoamtpqe8KDwz8KgAw8ElYTRpdeucfjP2hEvTwbU_phrS3p3TzVBfKhO_KQZ_9UO_R7dUyUiYxk5sFiXOKGX65hqA7fFHkZ9MLIZdP_lmNxMjuG-0BZiLIzjJ1FQfv3uY7A7do6UkANcrGw";

function formatPrice(n) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

const PRICE_BRACKETS = [
  { id: "lt50", label: "Dưới 50k", test: (p) => p.price < 50000 },
  { id: "50_100", label: "50k - 100k", test: (p) => p.price >= 50000 && p.price <= 100000 },
  { id: "all", label: "Mọi mức giá", test: () => true },
];

export default function CategoryListing() {
  const { slug } = useParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("popular");
  const [priceFilter, setPriceFilter] = useState(["all"]);
  const { addItem } = useCart();

  const category = useMemo(
    () => categories.find((c) => c.slug === slug),
    [categories, slug]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [cats, res] = await Promise.all([
          api.getCategories(),
          api.getProducts({ category: slug, limit: 100 }),
        ]);
        if (cancelled) return;
        setCategories(cats);
        setProducts(res.items || []);
        setTotal(res.total || 0);
      } catch {
        if (!cancelled) {
          setProducts([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const filtered = useMemo(() => {
    let list = [...products];
    const active =
      priceFilter.includes("all") || priceFilter.length === 0
        ? null
        : PRICE_BRACKETS.filter((b) => priceFilter.includes(b.id) && b.id !== "all");
    if (active?.length) {
      list = list.filter((p) => active.some((b) => b.test(p)));
    }
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name, "vi"));
    return list;
  }, [products, priceFilter, sort]);

  function togglePrice(id) {
    if (id === "all") {
      setPriceFilter(["all"]);
      return;
    }
    setPriceFilter((prev) => {
      const next = prev.filter((x) => x !== "all");
      const has = next.includes(id);
      const n = has ? next.filter((x) => x !== id) : [...next, id];
      return n.length === 0 ? ["all"] : n;
    });
  }

  const title = category?.name || "Danh mục";

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pb-20">
      <nav className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest text-on-surface-variant font-medium">
        <Link to="/" className="hover:text-primary transition-colors">
          Trang chủ
        </Link>
        <span className="material-symbols-outlined text-[10px]">chevron_right</span>
        <span className="text-primary font-bold">{title}</span>
      </nav>

      <section className="relative w-full min-h-[220px] sm:h-[280px] rounded-xl overflow-hidden mb-10 sm:mb-12 flex items-center">
        <div className="absolute inset-0 bg-primary-container/20 z-10" />
        <img
          alt=""
          src={BANNER_DEFAULT}
          className="absolute inset-0 w-full h-full object-cover blur-[2px] scale-105"
        />
        <div className="relative z-20 px-4 md:px-8 py-8">
          <h1 className="text-3xl sm:text-5xl font-poppins font-extrabold text-white tracking-tighter drop-shadow-sm max-w-xl leading-tight">
            {title}
            <br />
            <span className="text-2xl sm:text-3xl font-bold opacity-95">tươi mỗi ngày</span>
          </h1>
          <p className="text-white/90 mt-3 sm:mt-4 font-medium tracking-wide bg-primary-container/40 backdrop-blur-sm inline-block px-4 py-1 rounded-sm uppercase text-[10px] sm:text-xs">
            Botanical Selection
          </p>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <aside className="w-full lg:w-64 shrink-0">
          <div className="lg:sticky lg:top-28 space-y-8">
            <div>
              <h3 className="font-poppins text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  category
                </span>
                Danh mục
              </h3>
              <ul className="space-y-2">
                {categories.map((c) => (
                  <li key={c._id}>
                    <Link
                      to={`/danh-muc/${c.slug}`}
                      className={`flex justify-between items-center text-sm font-medium px-4 py-2.5 rounded-lg transition-colors ${
                        c.slug === slug
                          ? "text-primary bg-white shadow-sm"
                          : "text-stone-500 hover:translate-x-0.5 hover:text-primary"
                      }`}
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-poppins text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">payments</span>
                Khoảng giá
              </h3>
              <div className="space-y-2 px-1">
                {PRICE_BRACKETS.map((b) => (
                  <label key={b.id} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={priceFilter.includes(b.id)}
                      onChange={() => togglePrice(b.id)}
                      className="rounded border-outline-variant text-primary focus:ring-primary-fixed-dim"
                    />
                    <span
                      className={`text-sm font-medium transition-colors ${
                        priceFilter.includes(b.id) ? "text-primary font-bold" : "text-stone-600 group-hover:text-primary"
                      }`}
                    >
                      {b.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-poppins text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">verified</span>
                Tiêu chuẩn
              </h3>
              <div className="space-y-1 px-1">
                {["VietGAP", "Organic", "Global GAP"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="w-full text-left px-4 py-2 text-sm font-medium rounded-lg text-stone-500 hover:bg-stone-100 transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8 bg-surface-container-low px-4 md:px-6 py-4 rounded-xl">
            <span className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">
              {loading ? "…" : `${filtered.length} sản phẩm`}
            </span>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-xs font-bold uppercase text-stone-400">Sắp xếp:</span>
              <div className="flex gap-3 flex-wrap">
                {[
                  { id: "popular", label: "Phổ biến" },
                  { id: "price-asc", label: "Giá thấp → cao" },
                  { id: "name", label: "Tên A-Z" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSort(s.id)}
                    className={`text-xs font-bold transition-colors ${
                      sort === s.id
                        ? "text-primary underline decoration-2 underline-offset-4"
                        : "text-stone-500 hover:text-primary"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <p className="text-on-surface-variant">Đang tải…</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
              {filtered.map((p) => (
                <div
                  key={p._id}
                  className="group bg-surface-container-lowest p-5 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-editorial"
                >
                  <Link to={`/san-pham/${p.slug}`} className="block relative aspect-square mb-5 overflow-hidden rounded-lg bg-surface-container-low">
                    {p.badgeFresh ? (
                      <span className="absolute top-3 left-3 z-10 bg-primary-fixed text-on-primary-fixed text-[10px] font-bold px-2 py-1 rounded uppercase">
                        Tươi mới
                      </span>
                    ) : null}
                    {p.badgeSale ? (
                      <span className="absolute top-3 right-3 z-10 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold px-2 py-1 rounded uppercase">
                        Sale
                      </span>
                    ) : null}
                    <img
                      src={(p.images && p.images[0]) || BANNER_DEFAULT}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <Link to={`/san-pham/${p.slug}`}>
                    <h4 className="font-poppins font-bold text-primary text-lg leading-tight mb-2 line-clamp-2 hover:underline">
                      {p.name}
                    </h4>
                  </Link>
                  <div className="flex items-center justify-between mt-4 pt-2">
                    <span className="text-xl font-poppins font-extrabold text-primary-container">
                      {formatPrice(p.price)}
                    </span>
                    <button
                      type="button"
                      onClick={() => addItem(p, 1)}
                      className="bg-primary-container text-white p-2 rounded-lg hover:opacity-90 active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-xl fill">add_shopping_cart</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && filtered.length === 0 ? (
            <p className="text-on-surface-variant text-center py-12">
              Không có sản phẩm.{" "}
              <Link to="/" className="text-primary-container font-bold underline">
                Về trang chủ
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
