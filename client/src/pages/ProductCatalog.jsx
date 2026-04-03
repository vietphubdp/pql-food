import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { apiUrl } from "../config/apiBase.js";
import { useCart } from "../context/CartContext.jsx";

const PAGE_SIZE = 12;

function formatPrice(n) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

const PLACEHOLDER =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBJbSjfpqF6wntThmxhkjNQ4DBxHJZfRbTGSDUah68wmnYf3-LoRn4Z0_P6Xzm0S790w3PWG1PJsH4cDAhndDDF-f0nsadxZ_8suVe71JubGNZ_lNN5YvocA2fZyLalIZpq_GZvKrTRjyjzmUdm8DnHSGjOeRj0qfdiMTJBnQANRGtPsf3U-QhUkNTEtVvq2eGJcld66r-H80IfaAtCkIIl94zfirDCZPnHxUKd-AlolyX9mEagHvK2i693OM9EejiSMA5_cttgbvs";

export default function ProductCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = (searchParams.get("search") || "").trim();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const { addItem } = useCart();

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const skip = (page - 1) * PAGE_SIZE;
        const q = { limit: PAGE_SIZE, skip };
        if (search) q.search = search;
        const res = await api.getProducts(q);
        if (cancelled) return;
        setItems(res.items || []);
        setTotal(res.total || 0);
      } catch (e) {
        if (!cancelled) setErr(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, search]);

  const pageList = useMemo(() => {
    const maxBtn = 7;
    if (totalPages <= maxBtn) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const half = Math.floor(maxBtn / 2);
    let start = Math.max(1, page - half);
    let end = Math.min(totalPages, start + maxBtn - 1);
    start = Math.max(1, end - maxBtn + 1);
    const arr = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }, [page, totalPages]);

  function goToPage(p) {
    const next = new URLSearchParams(searchParams);
    if (p <= 1) next.delete("page");
    else next.set("page", String(p));
    setSearchParams(next, { replace: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const title = search ? `Kết quả “${search}”` : "Tất cả sản phẩm";

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pb-20 pt-8">
      <nav className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest text-on-surface-variant font-medium">
        <Link to="/" className="hover:text-primary transition-colors">
          Trang chủ
        </Link>
        <span className="material-symbols-outlined text-[10px]">chevron_right</span>
        <span className="text-primary font-bold">{title}</span>
      </nav>

      <header className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold font-headline text-primary-container">{title}</h1>
          <p className="text-on-surface-variant text-sm mt-2">
            {loading ? "…" : `${total} sản phẩm`}
            {totalPages > 1 ? ` · Trang ${page}/${totalPages}` : null}
          </p>
        </div>
        <Link
          to="/"
          className="text-sm font-semibold text-primary-container hover:underline w-fit"
        >
          ← Về trang chủ
        </Link>
      </header>

      {err ? <p className="text-error mb-6">{err}</p> : null}

      {loading ? (
        <p className="text-center text-on-surface-variant py-16">Đang tải…</p>
      ) : items.length === 0 ? (
        <p className="text-center text-on-surface-variant py-16">
          Không có sản phẩm.{" "}
          <Link to="/" className="text-primary-container font-bold underline">
            Về trang chủ
          </Link>
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {items.map((p) => (
              <div
                key={p._id}
                className="group bg-surface-container-lowest rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-300 shadow-editorial"
              >
                <Link to={`/san-pham/${p.slug}`} className="block relative aspect-square overflow-hidden">
                  <img
                    alt={p.name}
                    src={apiUrl((p.images && p.images[0]) || PLACEHOLDER)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {p.badgeFresh || p.badgeSale ? (
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 items-start pointer-events-none">
                      {p.badgeFresh ? (
                        <span className="bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                          Tươi mới
                        </span>
                      ) : null}
                      {p.badgeSale ? (
                        <span className="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                          Sale
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </Link>
                <div className="p-6">
                  <Link to={`/san-pham/${p.slug}`}>
                    <h3 className="font-bold text-lg text-primary-container mb-2 hover:underline line-clamp-2">
                      {p.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-3 mb-6 flex-wrap">
                    <span className="text-xl font-black text-primary">{formatPrice(p.price)}</span>
                    {p.compareAtPrice ? (
                      <span className="text-sm text-outline line-through">{formatPrice(p.compareAtPrice)}</span>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => addItem(p, 1)}
                    className="w-full bg-primary-container text-on-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                    Thêm giỏ hàng
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 ? (
            <nav
              className="mt-12 flex flex-wrap items-center justify-center gap-2"
              aria-label="Phân trang"
            >
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
                className="px-4 py-2 rounded-xl border border-outline-variant/30 text-sm font-semibold text-primary-container disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-low"
              >
                Trước
              </button>
              {pageList.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => goToPage(p)}
                  className={`min-w-[2.5rem] px-3 py-2 rounded-xl text-sm font-bold ${
                    p === page
                      ? "bg-primary-container text-on-primary"
                      : "border border-outline-variant/30 text-primary-container hover:bg-surface-container-low"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => goToPage(page + 1)}
                className="px-4 py-2 rounded-xl border border-outline-variant/30 text-sm font-semibold text-primary-container disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-low"
              >
                Sau
              </button>
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}
