import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { apiUrl } from "../config/apiBase.js";
import { useCart } from "../context/CartContext.jsx";

function formatPrice(n) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [productTotal, setProductTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [params] = useSearchParams();
  const search = params.get("search") || "";
  const { addItem } = useCart();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const productQuery = { limit: 12, skip: 0 };
        if (search) productQuery.search = search;
        const [cats, prodRes] = await Promise.all([
          api.getCategories(),
          api.getProducts(productQuery),
        ]);
        if (cancelled) return;
        setCategories(cats);
        setProducts(prodRes.items || []);
        setProductTotal(prodRes.total ?? 0);
      } catch (e) {
        if (!cancelled) setErr(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [search]);

  const heroImg =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBJbSjfpqF6wntThmxhkjNQ4DBxHJZfRbTGSDUah68wmnYf3-LoRn4Z0_P6Xzm0S790w3PWG1PJsH4cDAhndDDF-f0nsadxZ_8suVe71JubGNZ_lNN5YvocA2fZyLalIZpq_GZvKrTRjyjzmUdm8DnHSGjOeRj0qfdiMTJBnQANRGtPsf3U-QhUkNTEtVvq2eGJcld66r-H80IfaAtCkIIl94zfirDCZPnHxUKd-AlolyX9mEagHvK2i693OM9EejiSMA5_cttgbvs";

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 lg:py-20 grid lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-8">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-primary-container font-headline leading-[1.1] tracking-tight">
            Thực phẩm tươi ngon <br /> cho mỗi bữa ăn
          </h1>
          <p className="text-lg text-on-surface-variant max-w-lg leading-relaxed">
            Rau củ hữu cơ, hải sản và thịt sạch. Giao nhanh trong 2h tại nội thành.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/gio-hang"
              className="bg-primary-container text-on-primary px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-xl shadow-primary-container/20 inline-block"
            >
              Mua ngay
            </Link>
            <a
              href="#danh-muc"
              className="border-2 border-primary-container text-primary-container px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-container hover:text-white transition-all inline-block"
            >
              Xem danh mục
            </a>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-fixed/30 to-transparent rounded-full blur-3xl -z-10" />
          <img
            alt="Giỏ thực phẩm tươi"
            src={heroImg}
            className="w-full h-auto rounded-[2rem] shadow-editorial transform rotate-2 hover:rotate-0 transition-transform duration-500 object-cover aspect-[4/3]"
          />
        </div>
      </section>

      <section id="danh-muc" className="bg-surface-container-low py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-headline text-primary-container">
                Khám phá danh mục
              </h2>
              <div className="h-1 w-20 bg-primary-fixed mt-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((c) => (
              <Link
                key={c._id}
                to={`/danh-muc/${c.slug}`}
                className="group flex flex-col items-center gap-4"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-secondary-fixed-dim flex items-center justify-center group-hover:bg-primary-fixed group-hover:scale-110 transition-all duration-300">
                  <span className="material-symbols-outlined text-3xl text-on-secondary-fixed-variant">
                    {c.icon || "eco"}
                  </span>
                </div>
                <span className="font-bold text-primary-container text-center text-sm md:text-base">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12 text-center sm:text-left">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-extrabold font-headline text-primary-container mb-1">
              {search ? `Kết quả “${search}”` : "Sản phẩm cung cấp"}
            </h2>
            {!search ? (
              <p className="text-sm text-on-surface-variant">Sắp xếp theo mới nhất</p>
            ) : null}
          </div>
          {!loading && productTotal > 12 ? (
            <Link
              to={search ? `/cua-hang?search=${encodeURIComponent(search)}` : "/cua-hang"}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-primary-container text-primary-container font-bold text-sm hover:bg-primary-container hover:text-on-primary transition-colors shrink-0 mx-auto sm:mx-0"
            >
              Xem tất cả
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          ) : null}
        </div>
        {loading ? (
          <p className="text-center text-on-surface-variant">Đang tải sản phẩm...</p>
        ) : err ? (
          <p className="text-center text-error">{err}</p>
        ) : products.length === 0 ? (
          <p className="text-center text-on-surface-variant">Chưa có sản phẩm.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((p) => (
              <div
                key={p._id}
                className="group bg-surface-container-lowest rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-300 shadow-editorial"
              >
                <Link to={`/san-pham/${p.slug}`} className="block relative aspect-square overflow-hidden">
                  <img
                    alt={p.name}
                    src={apiUrl((p.images && p.images[0]) || heroImg)}
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
                    <h3 className="font-bold text-lg text-primary-container mb-2 hover:underline">
                      {p.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-3 mb-6 flex-wrap">
                    <span className="text-xl font-black text-primary">{formatPrice(p.price)}</span>
                    {p.compareAtPrice ? (
                      <span className="text-sm text-outline line-through">
                        {formatPrice(p.compareAtPrice)}
                      </span>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => addItem(p, 1)}
                    className="w-full bg-primary-container text-on-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm fill">add_shopping_cart</span>
                    Thêm giỏ hàng
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-20">
        <div className="relative rounded-[2rem] overflow-hidden min-h-[240px] md:h-[300px] flex items-center px-8 md:px-12 group">
          <div className="absolute inset-0 bg-primary-container" />
          <div className="relative z-10 space-y-4 max-w-lg">
            <h2 className="text-2xl md:text-4xl font-extrabold text-white font-headline leading-tight">
              Ưu đãi: Miễn phí ship đơn từ 500.000đ
            </h2>
            <p className="text-on-primary-container/90 text-base md:text-lg">
              Áp dụng nội thành. Tự động khi đặt hàng qua website.
            </p>
            <Link
              to="/gio-hang"
              className="inline-block bg-surface-container-lowest text-primary-container px-8 py-3 rounded-xl font-bold hover:bg-primary-fixed transition-colors"
            >
              Mua ngay
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-surface-container-high/30 py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {[
            { icon: "temp_preferences_eco", t: "Tươi mỗi ngày", d: "Nhập mới mỗi sáng từ nông trại." },
            { icon: "verified", t: "Nguồn gốc rõ ràng", d: "Truy xuất QR trên từng sản phẩm." },
            { icon: "local_shipping", t: "Giao nhanh 2h", d: "Giữ độ tươi trong quá trình giao." },
            { icon: "assignment_return", t: "Hỗ trợ đổi trả", d: "Đổi trả nếu không hài lòng." },
          ].map((x) => (
            <div key={x.t} className="flex items-start gap-5">
              <div className="p-3 rounded-2xl bg-primary-fixed shrink-0">
                <span className="material-symbols-outlined text-on-primary-fixed text-3xl">{x.icon}</span>
              </div>
              <div>
                <h4 className="font-bold text-lg text-primary-container mb-1">{x.t}</h4>
                <p className="text-sm text-on-surface-variant">{x.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
