import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useCart } from "../context/CartContext.jsx";

function formatPrice(n) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

export default function ProductDetail() {
  const { slug } = useParams();
  const nav = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [tab, setTab] = useState("detail");
  const { addItem } = useCart();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const p = await api.getProductBySlug(slug);
        if (cancelled) return;
        setProduct(p);
        setImgIdx(0);
        setQty(1);
        if (p.category && p.category._id) {
          const res = await api.getProducts({
            category: String(p.category._id),
            limit: 8,
          });
          if (!cancelled) {
            setRelated((res.items || []).filter((x) => x._id !== p._id).slice(0, 4));
          }
        } else setRelated([]);
      } catch (e) {
        if (!cancelled) setErr(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 text-on-surface-variant">Đang tải...</div>
    );
  }
  if (err || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 text-error">
        {err || "Không tìm thấy sản phẩm"}{" "}
        <Link to="/" className="underline text-primary-container">
          Về trang chủ
        </Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [];
  const mainImg = images[imgIdx] || images[0] || "";
  const thumbs = images.length ? images.slice(0, 4) : [];
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : null;

  function buyNow() {
    addItem(product, qty);
    nav("/thanh-toan");
  }

  return (
    <div className="pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-6">
        <nav className="flex flex-wrap items-center gap-2 text-xs font-label uppercase tracking-widest text-on-surface-variant/70">
          <Link to="/" className="hover:text-primary-container transition-colors">
            Cửa hàng
          </Link>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          {product.category ? (
            <Link
              to={`/danh-muc/${product.category.slug}`}
              className="hover:text-primary-container transition-colors"
            >
              {product.category.name}
            </Link>
          ) : (
            <span>Danh mục</span>
          )}
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <span className="text-primary-container font-semibold line-clamp-1">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        <div className="lg:col-span-7 space-y-5">
          <div className="relative aspect-square bg-surface-container-lowest rounded-xl overflow-hidden shadow-editorial group cursor-default">
            {product.badgeFresh ? (
              <span className="absolute top-4 left-4 z-10 bg-primary-fixed text-on-primary-fixed text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                Mùa mới
              </span>
            ) : null}
            {mainImg ? (
              <img
                src={mainImg}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : null}
            <div className="absolute bottom-4 right-4 p-2.5 bg-surface-container-lowest/85 backdrop-blur rounded-full text-primary-container shadow-editorial pointer-events-none">
              <span className="material-symbols-outlined">zoom_in</span>
            </div>
          </div>
          {thumbs.length > 0 ? (
            <div className="grid grid-cols-4 gap-3 sm:gap-4">
              {thumbs.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImgIdx(idx)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    imgIdx === idx ? "border-primary-container ring-2 ring-primary-container/20" : "border-transparent opacity-90 hover:opacity-100"
                  }`}
                >
                  <img src={images[idx]} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            {product.featured ? (
              <span className="px-3 py-1 bg-primary-fixed text-on-primary-fixed text-[10px] font-bold uppercase tracking-widest rounded-full">
                Nổi bật
              </span>
            ) : null}
            {product.badgeSale ? (
              <span className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold uppercase tracking-widest rounded-full">
                Sale
              </span>
            ) : null}
            <div className="flex items-center text-primary-container">
              <span className="material-symbols-outlined text-sm fill">star</span>
              <span className="ml-1 text-sm font-semibold">4.8</span>
              <span className="ml-1 text-on-surface-variant/60 text-sm">(đánh giá)</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-poppins font-bold text-primary-container leading-tight tracking-tight mb-4">
            {product.name}
          </h1>

          <div className="flex items-baseline gap-3 mb-5 flex-wrap">
            <span className="text-2xl sm:text-3xl font-headline font-bold text-primary-container">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice ? (
              <span className="text-lg sm:text-xl font-headline text-on-surface-variant/40 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            ) : null}
            {discount ? (
              <span className="text-sm font-label text-error font-semibold">Giảm {discount}%</span>
            ) : null}
          </div>

          <div className="inline-flex items-center px-3 py-1.5 bg-surface-container-high rounded-md mb-6 w-fit">
            <span className="material-symbols-outlined text-sm text-primary-container mr-2">inventory_2</span>
            <span className="text-sm font-medium text-primary-container">
              Còn hàng ({product.stock} sản phẩm)
            </span>
          </div>

          {product.shortDescription || product.description ? (
            <p className="text-on-surface-variant leading-relaxed text-base sm:text-lg mb-8 border-l-4 border-primary-fixed-dim pl-5 italic">
              “{product.shortDescription || product.description?.slice(0, 200)}…”
            </p>
          ) : null}

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
              <div className="flex items-center bg-surface-container-low rounded-md p-1 border border-outline-variant/20 w-fit">
                <button
                  type="button"
                  className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high transition-colors rounded-sm"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <span className="w-12 text-center font-bold text-primary-container">{qty}</span>
                <button
                  type="button"
                  className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high transition-colors rounded-sm"
                  onClick={() => setQty((q) => q + 1)}
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {["#tuoi", "#organic", "#pqlfood"].map((tag) => (
                  <span key={tag} className="text-xs font-bold text-primary-container/50 uppercase tracking-tighter">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => addItem(product, qty)}
                className="py-4 px-6 border-2 border-primary-container text-primary-container font-bold rounded-md hover:bg-primary-container hover:text-on-primary transition-all active:scale-[0.98]"
              >
                Thêm vào giỏ
              </button>
              <button
                type="button"
                onClick={buyNow}
                className="py-4 px-6 bg-primary-container text-white font-bold rounded-md hover:bg-primary transition-all shadow-lg active:scale-[0.98]"
              >
                Mua ngay
              </button>
            </div>
          </div>

          <div className="mt-10 space-y-3">
            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-primary-container">local_shipping</span>
              <span>Miễn phí giao khi đơn từ 500.000đ</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-primary-container">verified</span>
              <span>Nguồn gốc rõ ràng, chuẩn an toàn</span>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-16 md:mt-24 bg-surface-container-low py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex gap-6 sm:gap-10 border-b border-outline-variant/20 mb-8 overflow-x-auto pb-3">
            {[
              { id: "detail", label: "Mô tả chi tiết" },
              { id: "nutrition", label: "Bảo quản" },
              { id: "reviews", label: "Đánh giá" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`pb-3 whitespace-nowrap text-sm sm:text-base font-headline transition-colors ${
                  tab === t.id
                    ? "text-primary-container font-bold border-b-2 border-primary-container -mb-px"
                    : "text-on-surface-variant/60 hover:text-primary-container"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {tab === "detail" ? (
            <div className="max-w-3xl text-on-surface-variant leading-relaxed space-y-4">
              <p>{product.description || "Đang cập nhật nội dung sản phẩm."}</p>
              {product.origin ? (
                <p className="font-medium text-primary-container">Xuất xứ: {product.origin}</p>
              ) : null}
            </div>
          ) : null}
          {tab === "nutrition" ? (
            <ul className="max-w-xl space-y-2 text-on-surface-variant list-disc pl-5">
              <li>Bảo quản trong ngăn mát 2–6°C.</li>
              <li>Rửa sạch trước khi chế biến.</li>
              <li>Sử dụng trong 3–5 ngày sau khi nhận.</li>
            </ul>
          ) : null}
          {tab === "reviews" ? (
            <p className="text-on-surface-variant">Chức năng đánh giá sẽ được bổ sung sau.</p>
          ) : null}
        </div>
      </section>

      {related.length > 0 ? (
        <section className="max-w-7xl mx-auto px-4 md:px-8 mt-16 md:mt-20">
          <h2 className="text-2xl md:text-3xl font-poppins font-extrabold text-primary-container tracking-tight mb-8">
            Gợi ý cùng danh mục
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <div
                key={p._id}
                className="group bg-surface-container-lowest rounded-2xl p-5 hover:-translate-y-1 transition-all shadow-editorial"
              >
                <Link
                  to={`/san-pham/${p.slug}`}
                  className="block aspect-square rounded-xl overflow-hidden mb-4 bg-surface-container-low"
                >
                  <img
                    src={(p.images && p.images[0]) || mainImg}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </Link>
                <h4 className="text-base font-poppins font-bold text-primary mb-3 line-clamp-2">
                  <Link to={`/san-pham/${p.slug}`}>{p.name}</Link>
                </h4>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-primary">{formatPrice(p.price)}</span>
                  <button
                    type="button"
                    onClick={() => addItem(p, 1)}
                    className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
